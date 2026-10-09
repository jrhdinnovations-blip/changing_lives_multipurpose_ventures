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
      // 1. Query Admin users from user_profiles
      let adminEmails: string[] = [];

      try {
        const { data: adminProfiles } = await supabase
          .from('user_profiles')
          .select('id, email, role')
          .in('role', ['admin', 'super_admin']);

        if (adminProfiles && adminProfiles.length > 0) {
          adminEmails = adminProfiles.map((p) => p.email).filter(Boolean);
        }
      } catch (dbErr) {
        console.warn('[Loan Notification API] Error querying admin emails from user_profiles:', dbErr);
      }

      adminEmails = Array.from(
        new Set([
          ...adminEmails,
          'plangnansamson@gmail.com',
          'Changinglivesmultipurpose@gmail.com',
          'raymondlongdiem22@gmail.com',
          process.env.ADMIN_NOTIFICATION_EMAIL || '',
        ].filter(Boolean))
      );

      // 2. Send email to Admin
      const emailResult = await sendLoanAppliedEmailToAdmin(data, adminEmails);

      return NextResponse.json({
        success: true,
        event: 'loan_applied',
        recipientCount: emailResult.adminEmails.length,
        delivered: emailResult.delivered,
        details: emailResult,
        notice: emailResult.delivered
          ? 'Email successfully dispatched to administrator'
          : emailResult.error || 'SMTP delivery pending configuration',
      });
    }

    if (event === 'loan_approved') {
      // 1. Query Accountant users from user_profiles
      let accountantEmails: string[] = [];

      try {
        const { data: accountantProfiles } = await supabase
          .from('user_profiles')
          .select('id, email, role')
          .in('role', ['accountant', 'financial_secretary']);

        if (accountantProfiles && accountantProfiles.length > 0) {
          accountantEmails = accountantProfiles.map((p) => p.email).filter(Boolean);
        }
      } catch (dbErr) {
        console.warn('[Loan Notification API] Error querying accountant emails from user_profiles:', dbErr);
      }

      accountantEmails = Array.from(
        new Set([
          ...accountantEmails,
          'bimaeteng4@gmail.com',
          'Changinglivesmultipurpose@gmail.com',
          process.env.ACCOUNTANT_NOTIFICATION_EMAIL || '',
        ].filter(Boolean))
      );

      // 2. Send email to Accountant
      const emailResult = await sendLoanApprovedEmailToAccountant(data, accountantEmails);

      return NextResponse.json({
        success: true,
        event: 'loan_approved',
        recipientCount: emailResult.accountantEmails.length,
        delivered: emailResult.delivered,
        details: emailResult,
        notice: emailResult.delivered
          ? 'Email successfully dispatched to accountant'
          : emailResult.error || 'SMTP delivery pending configuration',
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
