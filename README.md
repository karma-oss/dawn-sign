# DAWN SIGN

> Go back to the field.

Doctors should be with patients.
Farmers should be in the fields.
Fishermen should be at sea.

Not managing expensive SaaS subscriptions.

DAWN is a suite of free, open-source business tools
built for clinics, farms, workshops, and small businesses.

Built with **karma-tags** — the Agent-Friendly UI standard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/karma-oss/dawn-sign)

## Features

- Electronic consent form management
- Markdown-based template editor with preview
- Email-based signature requests via Resend
- Signature pad with touch support
- Consent status matrix (patient x consent)
- Traffic light status indicators
- Multi-organization support

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (DB, Auth, Storage)
- Resend (Email)
- react-signature-canvas
- Playwright (E2E)

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local with your keys
npm run dev
```

## License

MIT — Free forever.
Powered by KARMA — Return to the field.
