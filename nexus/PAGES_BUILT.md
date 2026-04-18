# Nexus Frontend Pages Built

## Authentication
- `/pages/index.tsx` - Home redirect (checks auth, routes to dashboard)
- `/pages/auth/login.tsx` - OAuth login (role + platform selection)

## Creator Pages
- `/pages/creator/dashboard.tsx` - Opportunities, My Deals, Earnings tabs
- `/pages/creator/profile.tsx` - Creator profile view (name, tier, platforms, stats)

## Brand Pages
- `/pages/brand/dashboard.tsx` - Post opportunities, view applications, manage deals
- `/pages/brand/profile.tsx` - Brand profile view (name, website, company info)

## Shared Pages
- `/pages/chat.tsx` - Messaging system (conversations list + message thread)
- `/pages/discover.tsx` - Creator discovery with filters (tier, niche)
- `/pages/notifications.tsx` - Notification center with action links

## All Pages Call ValueSkins Backend APIs
- Creator: `/api/v1/creators/me`, `/api/v1/opportunities/recommended`, `/api/v1/deals/apply`, `/api/v1/deals/my-deals`
- Brand: `/api/v1/brands/me`, `/api/v1/brands/opportunities`, `/api/v1/brands/applications`, `/api/v1/opportunities/create`
- Chat: `/api/v1/chat/conversations`, `/api/v1/chat/conversations/{id}/messages`, `/api/v1/chat/messages/send`
- Discover: `/api/v1/creators/discover`
- Notifications: `/api/v1/notifications`, `/api/v1/notifications/{id}/read`

Architecture: Nexus is 100% decoupled from ValueSkins internals. All logic lives in backend. Frontend is pure UI.
