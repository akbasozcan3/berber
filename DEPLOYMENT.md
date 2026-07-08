# New Life Erkek Kuaförü — Production Deployment Guide

## Quick Start (Development)

```bash
npm install
cp .env.example .env.local
npm run db:seed
npm run dev
```

- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **Admin Login:** `ozcanakbas38@gmail.com` / `Ozcan2009ak`

## Environment Variables

Create `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_EMAIL=ozcanakbas38@gmail.com
ADMIN_PASSWORD=Ozcan2009ak
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
ADMIN_URL=https://yourdomain.com/admin/appointments
```

> **Security:** `TELEGRAM_BOT_TOKEN` must only be set server-side. Never expose it to the client.

## Features

- Online appointment booking with real-time slot availability
- Availability management (close days, date ranges, custom hours)
- Telegram owner notifications (Bot API with retry + logging)
- Admin panel with authentication (single admin)
- Real-time notifications (SSE + notification bell)
- CMS: hero slider, about article, page content
- Google reviews integrated + customer review submission
- Contact form with database storage

## Telegram Bot Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the Bot Token → set as `TELEGRAM_BOT_TOKEN` in `.env.local`
4. Get your Chat ID (message the bot, then visit `https://api.telegram.org/bot<TOKEN>/getUpdates`)
5. Set Chat ID in admin Settings → Telegram Chat ID

## Production Deployment (Vercel / VPS)

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

> Note: SQLite works for single-instance deployments. For multi-instance, migrate to PostgreSQL.

### VPS with Docker

```bash
docker compose up -d
```

## Business Info

- **Address:** Taşdelen Mah. Dekor Sok. No:26B, 34788 Çekmeköy/İstanbul
- **Phone:** +90 532 710 43 55
- **Instagram:** @newlifekuaforr
- **Google Rating:** 4.87/5 (30+ reviews)
