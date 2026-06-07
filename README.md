# Cafe POS

A multi-tenant point-of-sale system for small cafes. Each cafe gets its own storefront, admin panel, and order management — all under a single deployment.

## Features

- **Multi-tenant** — one deployment, unlimited cafes, each at `/{slug}`
- **Menu management** — items with images, options, categories, and sold-out toggles
- **Live orders** — real-time order queue with auto-polling and SMS notifications
- **Cart & checkout** — customer-facing ordering flow with quantity control and item options
- **Settings** — per-cafe accent color, logo, Venmo tips QR, and Twilio SMS credentials
- **Google & email auth** — Firebase Authentication with per-tenant ownership
- **Session tracking** — store sessions with order counts and history

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [MUI Joy UI](https://mui.com/joy-ui/getting-started/)
- [Firebase](https://firebase.google.com) — Firestore, Auth, Storage
- [Zustand](https://github.com/pmndrs/zustand) — cart state
- [Twilio](https://twilio.com) — optional SMS notifications

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/arya2krishnan/cafe-pos.git
cd cafe-pos
yarn install
```

### 2. Set up Firebase

1. Create a [Firebase project](https://console.firebase.google.com)
2. Enable **Firestore**, **Authentication** (Email/Password + Google), and **Storage**
3. Generate a service account key: Project Settings → Service Accounts → Generate new private key
4. Copy your web app config: Project Settings → General → Your apps

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your Firebase credentials. For `FIREBASE_SERVICE_ACCOUNT_JSON`, paste the entire service account JSON as a single-line string.

### 4. Run locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) and sign up to create your first cafe.

## SMS Notifications (optional)

Order-ready SMS notifications use Twilio. You can either:
- Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` in `.env.local` as a platform-wide default
- Or let each cafe owner paste their own Twilio credentials in their Settings page

See `/docs/sms-setup` in the running app for a step-by-step guide.

## Project Structure

```
app/
  [slug]/           # Per-cafe customer and admin pages
  api/[slug]/       # Protected API routes (items, orders, categories, etc.)
  api/cafe/         # Cafe creation and config
  signup/ setup/    # Onboarding flow
components/
  admin/            # Item form, category management, item cards
  common/           # Shared UI primitives (modals, quantity control, chips)
  items/            # Customer-facing item grid and options modal
  orders/           # Order card
  receipt/          # Cart drawer
  settings/         # Accent color picker, SMS preview
hooks/              # Custom React hooks (data fetching, form state, scroll sync)
lib/                # Firebase admin, auth utilities, API client
```

## License

MIT
