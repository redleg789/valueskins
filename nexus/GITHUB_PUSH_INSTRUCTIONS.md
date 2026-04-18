# How to Push Nexus to GitHub

## Step 1: Create Repo on GitHub
1. Go to https://github.com/new
2. Repository name: `nexus-platform`
3. Description: "Independent creator-brand marketplace powered by ValueSkins APIs"
4. Make it **Public**
5. DO NOT initialize with README (we have one)
6. Create repository

## Step 2: Push from /tmp/nexus-platform

```bash
cd /tmp/nexus-platform
git remote add origin https://github.com/redleg789/nexus-platform.git
git branch -M main
git push -u origin main
```

## Step 3: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `redleg789/nexus-platform`
4. Set environment variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.valueskins.io`
5. Click "Deploy"

## What Gets Deployed
- 10 pages (home, login, creator dashboard, brand dashboard, chat, discover, notifications, profiles)
- All calls to ValueSkins API backend
- OAuth login flow

That's it. Nexus is live and can be shared for testing.
