# Local Development Setup

This guide walks through setting up Nexus for local development with native email/password authentication.

## Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database (local or remote)
- Environment variables configured

## Step 1: Clone & Install Dependencies

```bash
cd nexus/frontend
npm install
```

## Step 2: Set Up PostgreSQL Database

### Option A: Using Neon (Recommended for Quick Setup)

1. Go to [neon.tech](https://neon.tech)
2. Sign up for free account
3. Create new project (PostgreSQL database)
4. Copy connection string

### Option B: Using Supabase

1. Go to [supabase.com](https://supabase.com)
2. Sign up for free account
3. Create new project
4. Go to Settings → Database → Connection String (Postgres URI)
5. Copy the connection string

### Option C: Local PostgreSQL (Docker)

```bash
# Using Docker
docker run --name nexus-postgres \
  -e POSTGRES_PASSWORD=nexus123 \
  -e POSTGRES_DB=nexus_dev \
  -p 5432:5432 \
  -d postgres:15

# Connection string
postgresql://postgres:nexus123@localhost:5432/nexus_dev
```

## Step 3: Configure Environment Variables

Create `.env.local` file in `nexus/frontend/`:

```bash
# Database (replace with your actual connection string)
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Secret (generate random string for production)
JWT_SECRET="your-random-secret-key-min-32-chars-long"

# OAuth (disabled - using native auth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=disabled
```

## Step 4: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate deploy

# Or push schema directly (for development)
npx prisma db push
```

## Step 5: Start Development Server

```bash
npm run dev
```

App will be available at: `http://localhost:3000`

## Step 6: Test Authentication Flow

### Signup
1. Navigate to `http://localhost:3000/auth/signup`
2. Enter:
   - Account Type: CREATOR or BRAND
   - Name: Your name
   - Email: test@example.com
   - Handle: testuser (must be unique, lowercase alphanumeric + underscore/dash)
   - Password: TestPassword123! (8+ chars, uppercase, lowercase, digit, special char)
   - Confirm Password: TestPassword123!
3. Click "Sign Up"
4. You should see: "Email verification sent" message
5. In development mode, check browser console for verification token (or check database)

### Email Verification

Development mode includes a token in the response. In production, you'll receive an email with a link.

To verify email in dev:
```bash
# Get the verification token from the signup response (_devToken)
# Then visit:
http://localhost:3000/auth/verify-email?userId=USER_ID&token=VERIFICATION_TOKEN
```

### Login
1. Navigate to `http://localhost:3000/auth/login`
2. Enter email and password
3. You should be logged in and redirected to home page
4. Token stored in localStorage
5. Profile page should show your user info

### Password Reset
1. Navigate to `http://localhost:3000/auth/forgot-password`
2. Enter your email
3. In development, you'll see reset token
4. Use the token to reset password:
   ```
   http://localhost:3000/auth/reset-password?userId=USER_ID&token=RESET_TOKEN
   ```
5. Enter new password and confirm
6. You'll be redirected to login with new password

## Step 7: Database Management

### View Database
```bash
# Open Prisma Studio
npx prisma studio
```

This opens a web UI where you can:
- View all tables
- Browse data
- Create/update/delete records
- Test queries

### Reset Database (Development Only)

```bash
# WARNING: This deletes all data
npx prisma migrate reset
```

## Debugging

### Check Logs
```bash
# Terminal logs show request/response details
# Check database directly:
npx prisma studio
```

### Database Connection Issues

**Error: "Invalid URL protocol"**
- Ensure DATABASE_URL is a PostgreSQL connection string
- Format: `postgresql://user:password@host:port/database`

**Error: "Cannot find module"**
```bash
npm install
npx prisma generate
```

**Error: "Relations exist but can't insert data"**
- Make sure all migrations have run: `npx prisma migrate deploy`

### API Testing

Test auth endpoints directly:

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "TestPass123!",
    "name": "Test User",
    "handle": "testuser",
    "userType": "CREATOR"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "TestPass123!"
  }'
```

## Next Steps

Once local development is working:

1. **Implement Email Sending**: Add SendGrid, SMTP, or Twilio to send actual verification/reset emails
2. **Add CAPTCHA**: Implement hCaptcha on signup after rate limit hits
3. **Deploy to Vercel**: See PRODUCTION_DEPLOYMENT_GUIDE.md
4. **Set Up Monitoring**: Add error tracking, analytics, real-time monitoring

---

**Questions?** Check [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md) for production deployment steps.
