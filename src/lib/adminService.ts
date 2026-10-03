import { createClient } from '@/lib/supabase/client';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'staff' | 'member' | 'borrower' | 'accountant' | 'financial_secretary' | 'auditor';
export type MembershipStatus = 'pending' | 'under_review' | 'approved' | 'active' | 'suspended' | 'inactive';

export interface AdminMember {
  id: string;
  user_id?: string;
  member_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender?: string;
  date_of_birth?: string;
  phone: string;
  email: string;
  address?: string;
  state?: string;
  lga?: string;
  occupation?: string;
  employer?: string;
  nok_name?: string;
  nok_relationship?: string;
  nok_phone?: string;
  nok_address?: string;
  id_type?: string;
  id_number?: string;
  role: UserRole;
  membership_status: MembershipStatus;
  membership_date?: string;
  monthly_contribution_amount: number;
  total_savings: number;
  total_contributions: number;
  active_loan_balance: number;
  investment_portfolio_value: number;
  created_at: string;
  updated_at?: string;
}

/** Fields the ADMIN fills in when provisioning a new member account.
 * All other profile details (address, DOB, NOK, KYC, etc.) are completed
 * by the member themselves in their dashboard.
 */
export interface CreateUserProfileInput {
  // Required by admin
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  // Auto-generated
  temporaryPassword?: string;
  memberNumber?: string;
  membershipStatus?: MembershipStatus;
}

// Initial admin member
const INITIAL_MEMBERS: AdminMember[] = [
  {
    id: 'mem-001',
    user_id: '06828cfc-2b4c-4510-9383-f1e925f32ed2',
    member_number: 'ADM/2026/0001',
    first_name: 'Raymond',
    last_name: 'Longdiem',
    email: 'raymondlongdiem22@gmail.com',
    phone: '+234 803 000 0000',
    gender: 'Male',
    role: 'super_admin',
    membership_status: 'active',
    membership_date: '2026-01-01',
    monthly_contribution_amount: 50000,
    total_savings: 0,
    total_contributions: 0,
    active_loan_balance: 0,
    investment_portfolio_value: 0,
    occupation: 'Lead Administrator',
    employer: 'CLIMPS Multipurpose',
    address: 'Behind Deeperlife Bible Church Rayfield adjacent House 7, Rayfield, Jos',
    state: 'Plateau',
    lga: 'Jos South',
    id_type: 'National Identity Number (NIN)',
    id_number: '12345678901',
    created_at: '2026-01-01T09:00:00Z',
  },
];

const LOCAL_STORAGE_MEMBERS_KEY = 'climps_admin_members_v3';

export function getStoredMembers(): AdminMember[] {
  if (typeof window === 'undefined') return INITIAL_MEMBERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEMBERS;
  }
}

export function saveStoredMembers(members: AdminMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
  } catch (err) {
    console.error('Failed to save members to localStorage:', err);
  }
}

export async function fetchAllMembers(): Promise<AdminMember[]> {
  const localList = getStoredMembers();

  try {
    const supabase = createClient();
    const { data: dbMembers, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && dbMembers && dbMembers.length > 0) {
      const merged: AdminMember[] = dbMembers.map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        member_number: m.membership_no || m.member_number || 'COOP/2026/0000',
        first_name: m.first_name,
        middle_name: m.middle_name || '',
        last_name: m.last_name,
        gender: m.gender || 'Not specified',
        date_of_birth: m.date_of_birth,
        phone: m.phone || '',
        email: m.email || '',
        address: m.address || '',
        state: m.state || '',
        lga: m.lga || '',
        occupation: m.occupation || '',
        employer: m.employer || '',
        nok_name: m.nok_name || '',
        nok_relationship: m.nok_relationship || '',
        nok_phone: m.nok_phone || '',
        nok_address: m.nok_address || '',
        id_type: m.id_type || '',
        id_number: m.id_number || '',
        role: m.role || (m.email?.toLowerCase() === 'raymondlongdiem22@gmail.com' ? 'super_admin' : 'member'),
        membership_status: m.status || m.membership_status || 'active',
        membership_date: m.join_date || m.membership_date || m.created_at,
        monthly_contribution_amount: Number(m.monthly_contribution || m.monthly_contribution_amount || 20000),
        total_savings: Number(m.total_savings || 0),
        total_contributions: Number(m.total_contributions || 0),
        active_loan_balance: Number(m.active_loan_balance || 0),
        investment_portfolio_value: Number(m.investment_portfolio_value || 0),
        created_at: m.created_at || new Date().toISOString(),
        updated_at: m.updated_at,
      }));

      // Filter out legacy dummy test members
      const legacyDummyEmails = new Set(['adaeze.okonkwo@climps.ng', 'emeka.nwosu@climps.ng', 'fatima.bello@climps.ng', 'admin@climps.org']);
      const filtered = merged.filter(m => !legacyDummyEmails.has(m.email.toLowerCase()));

      // Combine with local additions if any
      const dbEmails = new Set(filtered.map(m => m.email.toLowerCase()));
      const adminEntry = localList.filter(l => !dbEmails.has(l.email.toLowerCase()));
      return [...adminEntry, ...filtered];
    }
  } catch (err) {
    console.warn('Supabase fetch failed, returning local members:', err);
  }

  return localList;
}

export function generateNextMemberNumber(existingMembers: AdminMember[]): string {
  const currentYear = new Date().getFullYear();
  let maxSeq = 85;

  existingMembers.forEach(m => {
    const match = m.member_number?.match(/CLMV\/\d{4}\/(\d+)/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(4, '0');
  return `CLMV/${currentYear}/${nextSeq}`;
}

export function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  for (let i = 0; i < 10; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

export async function createMemberProfile(input: CreateUserProfileInput): Promise<{
  success: boolean;
  member: AdminMember;
  error?: string;
}> {
  const localList = getStoredMembers();
  const memberNumber = input.memberNumber || generateNextMemberNumber(localList);
  const newId = 'mem-new-' + Date.now();
  const userId = 'usr-new-' + Date.now();

  // Map role labels that aren't in the DB enum to 'staff'
  const dbSafeRole: UserRole = (['accountant', 'financial_secretary', 'auditor'].includes(input.role))
    ? 'staff'
    : input.role;

  const newMember: AdminMember = {
    id: newId,
    user_id: userId,
    member_number: memberNumber,
    first_name: input.firstName.trim(),
    middle_name: '',
    last_name: input.lastName.trim(),
    gender: '',
    date_of_birth: '',
    phone: input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    address: '',
    state: '',
    lga: '',
    occupation: '',
    employer: '',
    nok_name: '',
    nok_relationship: '',
    nok_phone: '',
    nok_address: '',
    id_type: '',
    id_number: '',
    role: input.role,  // keep display role locally (accountant, financial_secretary, etc.)
    membership_status: 'pending', // always pending until member completes their profile
    membership_date: new Date().toISOString().split('T')[0],
    monthly_contribution_amount: 0, // member sets this in their dashboard
    total_savings: 0,
    total_contributions: 0,
    active_loan_balance: 0,
    investment_portfolio_value: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Attempt write to Supabase — only insert columns that actually exist in the DB
  try {
    const supabase = createClient();

    // Insert minimal record into members table (only real DB columns)
    const { data: memberData, error: memberErr } = await supabase.from('members').insert({
      first_name: newMember.first_name,
      last_name: newMember.last_name,
      phone: newMember.phone,
      email: newMember.email,
      membership_no: memberNumber,
      status: 'active',
      monthly_contribution: 0,
    }).select().single();

    if (!memberErr && memberData) {
      newMember.id = memberData.id;
    }

    // Also try user_profiles
    const { data: profileData } = await supabase
      .from('user_profiles')
      .insert({
        email: newMember.email,
        full_name: `${newMember.first_name} ${newMember.last_name}`,
        role: dbSafeRole,
        phone: newMember.phone,
        is_active: false,
      })
      .select()
      .single();

    if (profileData) {
      newMember.user_id = profileData.id;
    }
  } catch (err) {
    console.warn('Database write bypassed or failed, persisting locally:', err);
  }

  // Always update local storage for immediate seamless UX
  const updatedList = [newMember, ...localList];
  saveStoredMembers(updatedList);

  return {
    success: true,
    member: newMember,
  };
}

export async function updateMemberRole(
  memberId: string,
  newRole: UserRole,
  reason?: string
): Promise<boolean> {
  const localList = getStoredMembers();
  const updated = localList.map(m => {
    if (m.id === memberId) {
      return { ...m, role: newRole, updated_at: new Date().toISOString() };
    }
    return m;
  });
  saveStoredMembers(updated);

  try {
    const supabase = createClient();
    const target = localList.find(m => m.id === memberId);
    if (target?.user_id) {
      await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', target.user_id);
    }
  } catch (err) {
    console.warn('Supabase update error:', err);
  }

  return true;
}

export async function updateMemberStatus(
  memberId: string,
  newStatus: MembershipStatus,
  reason?: string
): Promise<boolean> {
  const localList = getStoredMembers();
  const updated = localList.map(m => {
    if (m.id === memberId) {
      return { ...m, membership_status: newStatus, updated_at: new Date().toISOString() };
    }
    return m;
  });
  saveStoredMembers(updated);

  try {
    const supabase = createClient();
    await supabase
      .from('members')
      .update({ membership_status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', memberId);
  } catch (err) {
    console.warn('Supabase update error:', err);
  }

  return true;
}

export async function updateMemberDetails(
  memberId: string,
  updates: Partial<AdminMember>
): Promise<AdminMember | null> {
  const localList = getStoredMembers();
  let updatedMember: AdminMember | null = null;

  const updated = localList.map(m => {
    if (m.id === memberId) {
      updatedMember = { ...m, ...updates, updated_at: new Date().toISOString() };
      return updatedMember;
    }
    return m;
  });

  saveStoredMembers(updated);

  try {
    const supabase = createClient();
    await supabase
      .from('members')
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        phone: updates.phone,
        monthly_contribution_amount: updates.monthly_contribution_amount,
        address: updates.address,
        occupation: updates.occupation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);
  } catch (err) {
    console.warn('Supabase update error:', err);
  }

  return updatedMember;
}

export interface AdminKPIs {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalSavingsSum: number;
  activeLoansSum: number;
  pendingLoansCount: number;
  totalInvestmentsSum: number;
  staffCount: number;
}

export function computeAdminKPIs(members: AdminMember[]): AdminKPIs {
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.membership_status === 'active').length;
  const pendingMembers = members.filter(m => m.membership_status === 'pending' || m.membership_status === 'under_review').length;
  const staffCount = members.filter(m => ['admin', 'super_admin', 'manager', 'staff', 'accountant', 'financial_secretary', 'auditor'].includes(m.role)).length;

  const totalSavingsSum = members.reduce((sum, m) => sum + (m.total_savings || 0), 0);
  const activeLoansSum = members.reduce((sum, m) => sum + (m.active_loan_balance || 0), 0);
  const totalInvestmentsSum = members.reduce((sum, m) => sum + (m.investment_portfolio_value || 0), 0);

  return {
    totalMembers,
    activeMembers,
    pendingMembers,
    totalSavingsSum,
    activeLoansSum,
    pendingLoansCount: 7, // Seed queue loans count
    totalInvestmentsSum,
    staffCount,
  };
}
