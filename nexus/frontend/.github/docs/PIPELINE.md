# 🚀 CI/CD Pipeline Documentation

## Overview

This folder contains all CI/CD configurations for the Nexus app. The pipeline ensures code quality, security, and reliable deployments.

## Folder Structure

```
.github/
├── workflows/          # GitHub Actions workflow files
│   ├── ci.yml        # Continuous Integration (testing)
│   ├── cd.yml        # Continuous Deployment (production)
│   └── security.yml  # Security scanning
├── scripts/           # Helper scripts for pipelines
│   └── test.sh       # Test runner script
└── docs/             # Pipeline documentation
    └── PIPELINE.md    # This file
```

## Pipeline Stages

### 1. CI (Continuous Integration)
- **Trigger**: Every push to any branch
- **Runs**:
  - Install dependencies
  - Lint code
  - TypeScript type check
  - Build project
  - Run tests

### 2. CD (Continuous Deployment)
- **Trigger**: Push to `main` branch (after CI passes)
- **Runs**:
  - Deploy to Vercel (production)
  - Run smoke tests

### 3. Security Scanning
- **Trigger**: Weekly or on push
- **Runs**:
  - Dependency vulnerability scan
  - Secret detection
  - Code quality scan

## Required Secrets

Add these in GitHub → Settings → Secrets:

| Secret | Description | How to Get |
|--------|-------------|------------|
| `VERCEL_TOKEN` | Vercel API token | vercel.com/tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Project settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Project settings |

## How It Works

```
Push Code
    ↓
CI Workflow Runs
    ↓
┌─────────────┐
│   Lint      │ ← Fail → Fix code
│   TypeCheck │ ← Fail → Fix types  
│   Build     │ ← Fail → Fix build
│   Test      │ ← Fail → Fix tests
└─────────────┘
    ↓ (all pass)
CD Workflow (main only)
    ↓
Deploy to Vercel
    ↓
Smoke Tests
```

## Manual Deployment

If CI fails, you can deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
cd nexus/frontend
vercel --prod
```

## Adding New Steps

To add a new pipeline step:

1. **Edit `.github/workflows/ci.yml`**
2. Add your step under `steps:`
3. Example:
   ```yaml
   - name: My new step
     run: npm run my-new-command
   ```

## Troubleshooting

### Build fails
- Check `npm run build` locally
- Clear node_modules: `rm -rf node_modules && npm install`

### Deployment fails
- Check Vercel dashboard for error logs
- Verify secrets are set correctly

### Tests fail
- Run tests locally: `npm test`
- Check test output for errors

## Quick Commands

```bash
# Local CI check (everything except deploy)
npm run lint
npm run build
npm test

# Full deployment
git push origin main
```
