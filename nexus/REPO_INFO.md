# Nexus Platform - Separate Repo

**Location**: `/tmp/nexus-platform/`

## What's Inside
- Complete Next.js frontend (src/pages)
- OAuth login (Instagram, YouTube, TikTok, LinkedIn, Google)
- Creator dashboard (opportunities, deals, earnings)
- Brand dashboard (post opportunities, view applications, manage deals)
- Chat system
- Creator discovery/search
- Notifications

## Key Files
- `frontend/src/pages/index.tsx` - Home/redirect
- `frontend/src/pages/auth/login.tsx` - OAuth login
- `frontend/src/pages/creator/dashboard.tsx` - Creator view
- `frontend/src/pages/brand/dashboard.tsx` - Brand view
- `frontend/src/pages/chat.tsx` - Messaging
- `frontend/src/pages/discover.tsx` - Creator discovery
- `frontend/src/pages/notifications.tsx` - Notification center

## To Deploy to Vercel

1. Create GitHub repo: `nexus-platform`
2. Push code: `git push origin main`
3. Go to vercel.com/new
4. Import GitHub repo
5. Set environment variable: `NEXT_PUBLIC_API_URL=https://api.valueskins.io`
6. Deploy

Vercel will auto-deploy on every push to main.

## API Endpoints Used
All calls go to ValueSkins backend:
- `/api/v1/creators/*`
- `/api/v1/brands/*`
- `/api/v1/opportunities/*`
- `/api/v1/deals/*`
- `/api/v1/chat/*`
- `/api/v1/notifications/*`

This proves ValueSkins is modular and works with any frontend.
