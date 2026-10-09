import nodemailer from 'nodemailer';
import { createClient } from '@/lib/supabase/client';

export interface LoanAppliedNotificationData {
  applicationId?: string;
  applicationNumber: string;
  applicantName: string;
  applicantPhone: string;
  applicantEmail?: string;
  loanAmount: number;
  loanDurationMonths: number;
  loanPurpose: string;
  monthlyInterestAmount: number;
  totalRepaymentAmount: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  collateralType?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  submittedAt?: string;
}

export interface LoanApprovedNotificationData {
  applicationId?: string;
  applicationNumber: string;
  applicantName: string;
  applicantPhone?: string;
  loanAmount: number;
  loanDurationMonths: number;
  interestRatePercent?: number;
  monthlyInterestAmount?: number;
  monthlyRepaymentAmount?: number;
  totalRepaymentAmount?: number;
  accountName: string;
  accountNumber: string;
  bankName: string;
  approvedBy?: string;
  adminNotes?: string;
  approvedAt?: string;
}

function isPlaceholderValue(val?: string): boolean {
  if (!val) return true;
  const trimmed = val.trim().toLowerCase();
  return (
    trimmed === 'your-email-app-password' ||
    trimmed === 'your-smtp-password' ||
    trimmed === 'your-smtp-user' ||
    trimmed.startsWith('your-') ||
    trimmed === 'placeholder' ||
    trimmed === 'password'
  );
}

export function getSmtpStatus() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;

  const isConfigured = Boolean(host && user && pass && !isPlaceholderValue(pass) && !isPlaceholderValue(user));
  const hasPlaceholder = Boolean(isPlaceholderValue(pass) || isPlaceholderValue(user));

  return {
    isConfigured,
    hasPlaceholder,
    user: user || '',
    host: host || '',
  };
}

function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass || isPlaceholderValue(pass) || isPlaceholderValue(user)) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

function getFromAddress(): string {
  return (
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    '"Changing Lives Multipurpose Ventures" <Changinglivesmultipurpose@gmail.com>'
  );
}

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://changinglivesventures.com')
  );
}

/**
 * Send an email notification to the Admin when a member applies for a loan
 */
export async function sendLoanAppliedEmailToAdmin(
  data: LoanAppliedNotificationData,
  recipients?: string[]
) {
  const adminEmails = Array.from(
    new Set(
      [
        ...(recipients || []),
        'plangnansamson@gmail.com',
        process.env.ADMIN_NOTIFICATION_EMAIL,
        process.env.ADMIN_EMAIL,
        'Changinglivesmultipurpose@gmail.com',
        'raymondlongdiem22@gmail.com',
      ].filter(Boolean) as string[]
    )
  );

  const siteUrl = getSiteUrl();
  const reviewLink = `${siteUrl}/admin-dashboard/loans`;
  const formattedAmount = `₦${Number(data.loanAmount || 0).toLocaleString()}`;
  const formattedRepayment = `₦${Number(data.totalRepaymentAmount || 0).toLocaleString()}`;
  const formattedInterest = `₦${Number(data.monthlyInterestAmount || 0).toLocaleString()}`;
  const dateStr = data.submittedAt || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

  const subject = `🔔 [CLIMPS] New Loan Application: ${formattedAmount} - ${data.applicantName} (${data.applicationNumber})`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>New Loan Application</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070D1B; color: #E2E8F0; margin: 0; padding: 24px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0D172A; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0A1930 0%, #0F2A4A 100%); border-bottom: 2px solid #00E599;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">CLIMPS</span>
                    <span style="font-size: 11px; display: block; color: #94A3B8; margin-top: 2px;">Changing Lives Multipurpose Ventures</span>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                      Admin Action Needed
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #FFFFFF;">New Loan Application Received</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94A3B8; line-height: 1.5;">
                A new member has submitted a loan application requiring your review and verification.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Application Ref:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #00E599; font-family: monospace;" align="right">${data.applicationNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Applicant:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #FFFFFF;" align="right">${data.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Phone:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #E2E8F0;" align="right">${data.applicantPhone}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Amount Requested:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 16px; font-weight: 800; color: #38BDF8;" align="right">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Tenure:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #E2E8F0;" align="right">${data.loanDurationMonths} Months</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Monthly Rate & Interest:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #E2E8F0;" align="right">10% monthly (${formattedInterest}/mo)</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Total Repayment:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; font-weight: 700; color: #F1F5F9;" align="right">${formattedRepayment}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Purpose:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #CBD5E1;" align="right">${data.loanPurpose}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #94A3B8;">Disbursement Bank:</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #CBD5E1;" align="right">${data.bankName} • ${data.accountNumber}</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${reviewLink}" style="background-color: #00D084; color: #022013; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(0, 208, 132, 0.35);">
                  Review & Process Loan in Admin Portal →
                </a>
              </div>
              <p style="text-align: center; font-size: 11px; color: #64748B; margin: 0;">Submitted on: ${dateStr}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #070D1B; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 11px; color: #64748B;">
              Changing Lives Multipurpose Ventures • Rayfield, Jos, Plateau State<br />
              Automated Admin Notification System
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const transporter = getMailTransporter();
  let delivered = false;
  let deliveryError: string | undefined;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: getFromAddress(),
        to: adminEmails.join(', '),
        subject,
        html,
      });
      delivered = true;
      console.log(`[EmailService] Loan application notification successfully sent to admin: ${adminEmails.join(', ')}`);
    } catch (err: any) {
      deliveryError = err?.message || 'SMTP delivery failed';
      console.error('[EmailService] Failed to send email via SMTP transporter:', deliveryError);
    }
  } else {
    deliveryError = 'SMTP credentials not configured or contain placeholder in .env (SMTP_PASSWORD=your-email-app-password). Set a valid Gmail 16-character App Password to enable live email delivery.';
    console.log(`[EmailService: Notice] ${deliveryError} Notification logged for Admin (${adminEmails.join(', ')}): ${subject}`);
  }

  return { delivered, subject, adminEmails, error: deliveryError };
}

/**
 * Send an email notification to the Accountant when a loan is approved
 */
export async function sendLoanApprovedEmailToAccountant(
  data: LoanApprovedNotificationData,
  recipients?: string[]
) {
  const accountantEmails = Array.from(
    new Set(
      [
        ...(recipients || []),
        'bimaeteng4@gmail.com',
        process.env.ACCOUNTANT_NOTIFICATION_EMAIL,
        process.env.ACCOUNTANT_EMAIL,
        process.env.ADMIN_NOTIFICATION_EMAIL,
        'Changinglivesmultipurpose@gmail.com',
        'raymondlongdiem22@gmail.com',
      ].filter(Boolean) as string[]
    )
  );

  const siteUrl = getSiteUrl();
  const disbursementLink = `${siteUrl}/accountant-dashboard`;
  const formattedAmount = `₦${Number(data.loanAmount || 0).toLocaleString()}`;
  const formattedRepayment = `₦${Number(data.totalRepaymentAmount || 0).toLocaleString()}`;
  const monthlyRepayment = data.monthlyRepaymentAmount
    ? `₦${Number(data.monthlyRepaymentAmount).toLocaleString()}`
    : `₦${Number((data.totalRepaymentAmount || 0) / (data.loanDurationMonths || 1)).toLocaleString()}`;
  const dateStr = data.approvedAt || new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

  const subject = `✅ [CLIMPS] Action Required: Loan Approved for Disbursement: ${formattedAmount} - ${data.applicantName} (${data.applicationNumber})`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Loan Approved for Disbursement</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #070D1B; color: #E2E8F0; margin: 0; padding: 24px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0D172A; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #09261D 0%, #0D3E2F 100%); border-bottom: 2px solid #00E599;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">CLIMPS</span>
                    <span style="font-size: 11px; display: block; color: #86EFAC; margin-top: 2px;">Changing Lives Multipurpose Ventures</span>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(0, 229, 153, 0.2); color: #00E599; border: 1px solid rgba(0, 229, 153, 0.3); font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase;">
                      Accountant • Disbursement Notice
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 800; color: #FFFFFF;">Loan Approved for Payout / Disbursement</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94A3B8; line-height: 1.5;">
                An approved loan is awaiting account reconciliation and capital disbursement. Please review the recipient and payout schedule below:
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Borrower / Applicant:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #FFFFFF;" align="right">${data.applicantName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Loan Reference:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #00E599; font-family: monospace;" align="right">${data.applicationNumber}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Approved Principal:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 18px; font-weight: 900; color: #00E599;" align="right">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Monthly Interest Rate:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #E2E8F0;" align="right">10% Monthly Rate</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Monthly Repayment:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #E2E8F0;" align="right">${monthlyRepayment}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Tenure:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; color: #E2E8F0;" align="right">${data.loanDurationMonths} Months</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; color: #94A3B8;">Total Repayment Expected:</td>
                  <td style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; font-weight: 700; color: #F1F5F9;" align="right">${formattedRepayment}</td>
                </tr>
                <tr style="background-color: rgba(56, 189, 248, 0.05);">
                  <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; font-weight: 700; color: #38BDF8;">Beneficiary Bank:</td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #FFFFFF;" align="right">${data.bankName}</td>
                </tr>
                <tr style="background-color: rgba(56, 189, 248, 0.05);">
                  <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; font-weight: 700; color: #38BDF8;">Account Number:</td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 15px; font-weight: 900; color: #FFFFFF; font-family: monospace;" align="right">${data.accountNumber}</td>
                </tr>
                <tr style="background-color: rgba(56, 189, 248, 0.05);">
                  <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; font-weight: 700; color: #38BDF8;">Account Name:</td>
                  <td style="padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 13px; font-weight: 700; color: #FFFFFF;" align="right">${data.accountName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; color: #94A3B8;">Approved By / Notes:</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #CBD5E1;" align="right">${data.approvedBy || 'Admin'}${data.adminNotes ? ` • "${data.adminNotes}"` : ''}</td>
                </tr>
              </table>

              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="${disbursementLink}" style="background-color: #00E599; color: #022013; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 14px rgba(0, 229, 153, 0.35);">
                  Disburse & Reconcile in Accountant Portal →
                </a>
              </div>
              <p style="text-align: center; font-size: 11px; color: #64748B; margin: 0;">Approved on: ${dateStr}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color: #070D1B; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 11px; color: #64748B;">
              Changing Lives Multipurpose Ventures • Rayfield, Jos, Plateau State<br />
              Automated Financial Operations System
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const transporter = getMailTransporter();
  let delivered = false;
  let deliveryError: string | undefined;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: getFromAddress(),
        to: accountantEmails.join(', '),
        subject,
        html,
      });
      delivered = true;
      console.log(`[EmailService] Loan approved notification successfully sent to accountant: ${accountantEmails.join(', ')}`);
    } catch (err: any) {
      deliveryError = err?.message || 'SMTP delivery failed';
      console.error('[EmailService] Failed to send email via SMTP transporter:', deliveryError);
    }
  } else {
    deliveryError = 'SMTP credentials not configured or contain placeholder in .env (SMTP_PASSWORD=your-email-app-password). Set a valid Gmail 16-character App Password to enable live email delivery.';
    console.log(`[EmailService: Notice] ${deliveryError} Notification logged for Accountant (${accountantEmails.join(', ')}): ${subject}`);
  }

  return { delivered, subject, accountantEmails, error: deliveryError };
}
