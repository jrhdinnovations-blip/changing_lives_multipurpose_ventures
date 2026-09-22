import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const explicitNext = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (explicitNext) {
        return NextResponse.redirect(`${origin}${explicitNext}`);
      }

      // Check user role and membership status
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role || 'member';

      if (['super_admin', 'admin', 'manager', 'staff'].includes(role)) {
        return NextResponse.redirect(`${origin}/admin-dashboard`);
      }

      if (user?.id) {
        const { data: member } = await supabase
          .from('members')
          .select('kyc_completed, membership_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!member || !member.kyc_completed) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
        if (['pending', 'under_review'].includes(member.membership_status)) {
          return NextResponse.redirect(`${origin}/onboarding/pending`);
        }
      }

      return NextResponse.redirect(`${origin}/member-dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
