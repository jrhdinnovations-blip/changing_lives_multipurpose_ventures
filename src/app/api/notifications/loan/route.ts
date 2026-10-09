import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  sendLoanAppliedEmailToAdmin,
  sendLoanApprovedEmailToAccountant,
} from '@/lib/emailService';

async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'none',
                secure: true,
              })
            );
          } catch {}
        },
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, data } = body;

    if (!event || !data) {
      return NextResponse.json(
        { error: 'Missing required parameters: event and data' },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    if (event === 'loan_applied') {
      // 1. Query Admin users from user_profiles and members
      let adminEmails: string[] = [];
      let adminUserIds: string[] = [];

      try {
        const { data: adminProfiles } = await supabase
          .from('user_profiles')
          .select('id, email, role')
          .in('role', ['admin', 'super_admin']);

        if (adminProfiles && adminProfiles.length > 0) {
          adminUserIds = adminProfiles.map((p) => p.id);
          adminEmails = adminProfiles.map((p) => p.email).filter(Boolean);
        }

        const { data: adminMembers } = await supabase
          .from('members')
          .select('id, email, role')
          .in('role', ['admin', 'super_admin']);

        if (adminMembers && adminMembers.length > 0) {
          const memberEmails = adminMembers.map((m) => m.email).filter(Boolean);
          adminEmails = Array.from(new Set([...adminEmails, ...memberEmails]));
        }
      adminEmails = Array.from(new Set([...adminEmails, 'plangnansamson@gmail.com', 'Changinglivesmultipurpose@gmail.com']));
      } catch (dbErr) {
        console.warn('[Loan Notification API] Error querying admin emails:', dbErr);
        adminEmails = ['plangnansamson@gmail.com', 'Changinglivesmultipurpose@gmail.com'];
      }

      // 2. Send email to Admin
      const emailResult = await sendLoanAppliedEmailToAdmin(data, adminEmails);

      // 3. Record in-app notification for each Admin user if user IDs found
      if (adminUserIds.length > 0) {
        try {
          const notificationsToInsert = adminUserIds.map((userId) => ({
            user_id: userId,
            notification_type: 'loan_submitted' as any,
            title: `New Loan Application: ₦${Number(data.loanAmount || 0).toLocaleString()}`,
            message: `${data.applicantName} submitted loan application (${data.applicationNumber}) for ₦${Number(data.loanAmount || 0).toLocaleString()} (10% monthly rate).`,
            related_id: data.applicationId || null,
          }));

          await supabase.from('notifications').insert(notificationsToInsert);
        } catch (notifErr) {
          console.warn('[Loan Notification API] In-app notification insert skipped:', notifErr);
        }
      }

      return NextResponse.json({
        success: true,
        event: 'loan_applied',
        recipientCount: emailResult.adminEmails.length,
        delivered: emailResult.delivered,
        details: emailResult,
      });
    }

    if (event === 'loan_approved') {
      // 1. Query Accountant users from user_profiles and members
      let accountantEmails: string[] = [];
      let accountantUserIds: string[] = [];

      try {
        const { data: accountantProfiles } = await supabase
          .from('user_profiles')
          .select('id, email, role')
          .in('role', ['accountant', 'financial_secretary']);

        if (accountantProfiles && accountantProfiles.length > 0) {
          accountantUserIds = accountantProfiles.map((p) => p.id);
          accountantEmails = accountantProfiles.map((p) => p.email).filter(Boolean);
        }

        const { data: accountantMembers } = await supabase
          .from('members')
          .select('id, email, role')
          .in('role', ['accountant', 'financial_secretary']);

        if (accountantMembers && accountantMembers.length > 0) {
          const memberEmails = accountantMembers.map((m) => m.email).filter(Boolean);
          accountantEmails = Array.from(new Set([...accountantEmails, ...memberEmails]));
        }
        accountantEmails = Array.from(new Set([...accountantEmails, 'bimaeteng4@gmail.com', 'Changinglivesmultipurpose@gmail.com']));
      } catch (dbErr) {
        console.warn('[Loan Notification API] Error querying accountant emails:', dbErr);
        accountantEmails = ['bimaeteng4@gmail.com', 'Changinglivesmultipurpose@gmail.com'];
      }

      // 2. Send email to Accountant
      const emailResult = await sendLoanApprovedEmailToAccountant(data, accountantEmails);

      // 3. Record in-app notification for each Accountant user if user IDs found
      if (accountantUserIds.length > 0) {
        try {
          const notificationsToInsert = accountantUserIds.map((userId) => ({
            user_id: userId,
            notification_type: 'loan_approved' as any,
            title: `Loan Approved for Disbursement: ₦${Number(data.loanAmount || 0).toLocaleString()}`,
            message: `Loan for ${data.applicantName} (${data.applicationNumber}) approved for ₦${Number(data.loanAmount || 0).toLocaleString()}. Please reconcile & disburse.`,
            related_id: data.applicationId || null,
          }));

          await supabase.from('notifications').insert(notificationsToInsert);
        } catch (notifErr) {
          console.warn('[Loan Notification API] In-app notification insert skipped:', notifErr);
        }
      }

      return NextResponse.json({
        success: true,
        event: 'loan_approved',
        recipientCount: emailResult.accountantEmails.length,
        delivered: emailResult.delivered,
        details: emailResult,
      });
    }

    return NextResponse.json(
      { error: `Unhandled event type: ${event}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[Loan Notification API] Server Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error processing notification' },
      { status: 500 }
    );
  }
}
