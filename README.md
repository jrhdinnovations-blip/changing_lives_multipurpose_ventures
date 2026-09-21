# CLIMPS — Cooperative Savings, Investment & Loan Platform

A modern, full-featured web application for cooperative savings, investment tracking, and loan management built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

- **Cooperative Savings**: Track member savings accounts, monthly deposits, and interest yields.
- **Investment Management**: Portfolio monitoring, fixed-term investments, and returns calculation.
- **Loan Applications & Processing**: Multi-step loan requests, guarantor verification, and repayment schedules.
- **KYC & Onboarding**: Comprehensive member verification, document uploads, and identity confirmation.
- **Document & Agreement Management**: Digital agreements, contract signing, and compliance records.
- **Role-Based Access**: Multi-role support for members, administrators, loan officers, and auditors.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Edge Functions)
- **Icons & UI**: [Heroicons](https://heroicons.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/)
- **Charts**: [Recharts](https://recharts.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)

## 🏁 Getting Started

### 1. Prerequisites

- Node.js 20+ installed
- A Supabase project (or local Supabase instance)

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update your `.env` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:4028
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Setup

Apply the database migrations in `supabase/migrations/` to your Supabase project in order:
1. `20260921140000_climps_core_schema.sql`
2. `20260921143250_applications_table.sql`
3. `20260921150000_kyc_onboarding.sql`
4. `20260921160000_investors_circle.sql`
5. `20260921170000_climps_loan_application.sql`
6. `20260921180000_document_agreement_management.sql`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:4028](http://localhost:4028) in your browser.

## 📦 Available Scripts

- `npm run dev` — Start the local development server (port 4028)
- `npm run build` — Build the application for production
- `npm run start` — Run the production build
- `npm run lint` — Run ESLint code quality checks
- `npm run lint:fix` — Automatically fix linting issues
- `npm run format` — Format code with Prettier
- `npm run type-check` — Type check with TypeScript

## 📁 Project Structure

```
climps/
├── public/                # Static assets (images, icons)
├── src/
│   ├── app/               # Next.js App Router (pages and layouts)
│   ├── components/        # Reusable UI and business components
│   ├── contexts/          # React context providers (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and Supabase client
│   ├── types/             # TypeScript type definitions
│   └── styles/            # Global stylesheets
├── supabase/
│   └── migrations/        # Database SQL schema and migrations
├── image-hosts.config.mjs # Configured remote image host patterns
├── next.config.mjs        # Next.js configuration
├── tailwind.config.js     # Tailwind CSS theme & configuration
└── tsconfig.json          # TypeScript compiler options
```

## 📄 License

Private / Proprietary. All rights reserved.