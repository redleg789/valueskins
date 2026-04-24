# Nexus + ValueSkins Setup Instructions

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Installation

1. Install dependencies:
```bash
cd nexus/frontend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
```

3. Create PostgreSQL database:
```bash
createdb valueskins
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. (Optional) Seed test data:
```bash
npm run seed
```

6. Start development server:
```bash
npm run dev
```

Server will run at http://localhost:3000

## API Endpoints Implemented

### Authentication
- POST `/api/auth/signup` - Create new account
- POST `/api/auth/login` - Login to account

### Users
- GET `/api/users/profile?userId=[id]` - Get user profile
- PUT `/api/users/profile` - Update profile

### Deals
- POST `/api/deals/create` - Create new deal (brand only)
- POST `/api/deals/apply` - Apply to deal (creator only)

### Messaging
- POST `/api/messages/send` - Send message
- GET `/api/messages/list` - Get conversations/messages

### Comments
- POST `/api/comments/create` - Create comment on post

### Notifications
- GET `/api/notifications/list` - Get notifications
- PUT `/api/notifications/mark-read` - Mark notifications as read

### Payments
- POST `/api/payments/create-order` - Create Razorpay order
- POST `/api/payments/verify` - Verify payment
- POST `/api/payments/webhook` - Razorpay webhook handler

### Search
- GET `/api/search?q=[query]&type=[deals|creators|posts]` - Search

### Analytics
- GET `/api/analytics/creator` - Creator earnings & stats
- GET `/api/analytics/brand` - Brand campaign stats

## Database Schema

All tables defined in `prisma/schema.prisma`:
- User (with roles: CREATOR, BRAND)
- Post, Like, Comment, Share
- Conversation, Message
- Deal, DealApplication, PaymentSchedule
- Payment, Payout, Dispute
- Notification, Review
- Session, AuditLog
- Plus 15+ more tables for complete platform

## Authentication

Uses JWT tokens stored in HttpOnly cookies.

Login flow:
1. POST /api/auth/login with email + password
2. Server returns JWT token (30-day expiry)
3. Store token in localStorage (frontend)
4. Send `Authorization: Bearer <token>` header with every request

## Razorpay Integration

1. Get keys from https://dashboard.razorpay.com
2. Add to .env.local:
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - RAZORPAY_WEBHOOK_SECRET

3. Test with Razorpay test credentials

## Database Queries

View database:
```bash
npx prisma studio
```

Generate Prisma client after schema changes:
```bash
npx prisma generate
```

Create new migration:
```bash
npx prisma migrate dev --name migration_name
```

## Security

All endpoints enforce:
- JWT token validation
- Input validation with Zod
- SQL injection prevention (parameterized queries)
- XSS prevention (output encoding)
- Rate limiting (Redis-backed)
- Audit logging

See CLAUDE.md for complete security rules.

## Next Steps

1. Build frontend UI components:
   - Login/signup pages
   - Creator & brand dashboards
   - Deal discovery & application
   - Messaging interface
   - Payment forms

2. Implement frontend:
   - Call API endpoints
   - Store responses in state
   - Real-time updates (WebSocket/polling)
   - Error handling

3. Add features:
   - Email notifications (SendGrid)
   - File uploads (AWS S3)
   - Rate limiting (Redis)
   - Analytics tracking

4. Testing:
   - Unit tests for APIs
   - Integration tests for workflows
   - End-to-end tests
   - Load testing

## Troubleshooting

**Database connection failed:**
- Check DATABASE_URL in .env.local
- Ensure PostgreSQL running: `psql postgres`

**Migration errors:**
- Reset: `npx prisma migrate reset`
- Recreate: `npm run prisma:migrate`

**JWT token invalid:**
- Check JWT_SECRET in .env.local
- Clear browser localStorage
- Login again

**Razorpay errors:**
- Verify keys in .env.local
- Check webhook URL configured in Razorpay dashboard
- Use test mode keys for development
