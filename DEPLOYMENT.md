# DEPLOYMENT.md — GarageOS Deployment Guide

**Staging → Production Checklist**

---

## 📋 Pre-Deployment Checklist

Before any deployment, verify:

- [ ] All changes committed to git
- [ ] No console errors in development
- [ ] TypeScript passes: `npx tsc --noEmit`
- [ ] ESLint passes: `npx eslint . --ext .ts,.tsx`
- [ ] Environment variables set in `.env.local`
- [ ] Database migrations applied
- [ ] All tests passing (if applicable)

---

## 🟦 Stage 1: Staging Environment Setup

### 1.1 Create Staging Project on Vercel

```bash
# If not already set up
vercel --prod  # Deploy to production first time (creates project)
# OR use Vercel dashboard to create new project
```

**Staging URL:** `https://garageos-staging.vercel.app`

---

### 1.2 Staging Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase (use STAGING database if available, or same as prod)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Server-only!

# Resend (use staging email domain or same as prod)
RESEND_API_KEY=re_xxx...

# Application
NEXT_PUBLIC_APP_URL=https://garageos-staging.vercel.app
NODE_ENV=production
```

**Note:** For staging, you can use the same Supabase/Resend keys as production, or create separate staging projects. Using the same is faster for testing.

---

### 1.3 Deploy to Staging

```bash
# Push to staging branch
git push origin main

# Vercel auto-deploys on push (configure in dashboard)
# OR manually deploy via CLI:
vercel --prod --local
```

**Verify Staging:**
```bash
curl https://garageos-staging.vercel.app/dashboard
# Should return 200 OK
```

---

## 🟢 Stage 2: Staging Validation (Manual Testing)

### 2.1 Test Core Features

- [ ] **Auth Flow**
  - [ ] Signup works (create new account)
  - [ ] Login works (existing account)
  - [ ] Logout works
  - [ ] Password reset (if implemented)

- [ ] **Dashboard**
  - [ ] Load vehicles (shows correct user's vehicles only)
  - [ ] Responsive: mobile (1 col), tablet (2 col), desktop (3-4 col)
  - [ ] Add Vehicle button functional

- [ ] **Vehicle Details**
  - [ ] Page loads
  - [ ] Shows all spec fields
  - [ ] Edit button works (if implemented)
  - [ ] Images load (if applicable)

- [ ] **Termine (Maintenance)**
  - [ ] List loads
  - [ ] Filters work (All, Maintenance, Reminders)
  - [ ] Add Maintenance button works
  - [ ] Status badges display correctly

- [ ] **Settings & Sharing**
  - [ ] User email displays
  - [ ] Vehicle list shows
  - [ ] Can invite guests (email form)
  - [ ] User deletion works (with confirmation)
  - [ ] Revoke access removes user

- [ ] **Guest Invitations**
  - [ ] Invite email sent (check spam folder)
  - [ ] Email link valid (expires after 24hrs)
  - [ ] Password setup page loads
  - [ ] New guest can login
  - [ ] Guest sees only shared vehicles (RLS working)

### 2.2 Test Email Integration (Resend)

```bash
# Test invitation email
POST https://garageos-staging.vercel.app/api/users/add
{
  "email": "test-guest@example.com",
  "vehicle_ids": ["vehicle-id-1", "vehicle-id-2"]
}

# Check inbox for email from "GarageOS <onboarding@resend.dev>"
# (or your verified Resend domain)
```

### 2.3 Test Database Queries

```sql
-- Verify RLS is working
SELECT * FROM vehicles;  -- Should only see current user's vehicles

-- Check user_access table
SELECT * FROM user_access WHERE owner_id = auth.uid();
```

### 2.4 Performance Testing

```bash
# Lighthouse audit (Chrome DevTools)
# Target: >90 score for:
# - Performance
# - Accessibility
# - Best Practices
# - SEO
```

---

## 🟢 Stage 3: Resend Domain Verification (REQUIRED for Production)

Resend requires domain verification before you can send from your custom domain.

### 3.1 Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Login to your account
3. Navigate to API Keys
4. Copy your API Key
5. Add to environment variables: `RESEND_API_KEY=re_xxx...`

### 3.2 Verify Domain in Resend (Optional but Recommended)

For production, verify your domain to send from `noreply@yourdomain.com`:

1. **In Resend Dashboard:**
   - Go to Domains
   - Click "Add Domain"
   - Enter: `yourdomain.com` (e.g., `garageos.de`)
   - Resend generates DNS records

2. **In Your DNS Provider (e.g., Namecheap, Route53, etc.):**
   - Add the CNAME/MX records Resend provides
   - Example:
     ```
     CNAME: r1._domainkey.garageos.de → r1.resend.domains
     CNAME: r2._domainkey.garageos.de → r2.resend.domains
     ```
   - Wait for DNS propagation (5-30 minutes)

3. **Verify in Resend:**
   - Click "Verify Domain"
   - Status should change to ✅ Verified

4. **Update email sender in code:**
   ```typescript
   // src/lib/resend.ts
   from: "noreply@garageos.de"  // Custom domain instead of onboarding@resend.dev
   ```

### 3.3 Test Email with Custom Domain

```bash
POST https://garageos.vercel.app/api/users/add
{
  "email": "test@example.com",
  "vehicle_ids": ["id1"]
}

# Email should come from noreply@garageos.de
```

---

## 🟡 Stage 4: Production Environment Setup

### 4.1 Production Project on Vercel

Create separate production project if needed:

```bash
# Via Vercel Dashboard:
# 1. Create new project: "garageos-production"
# 2. Connect GitHub repo
# 3. Select production branch (e.g., main)
```

**Production URL:** `https://garageos.vercel.app`

### 4.2 Production Environment Variables

```env
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...  (production key)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...      (production key, server-only)

# Resend Production
RESEND_API_KEY=re_xxx...                 (production key)

# Application
NEXT_PUBLIC_APP_URL=https://garageos.vercel.app
NODE_ENV=production
```

### 4.3 Set Up Production Database

**If using Supabase Cloud:**

1. Create new Supabase project: `garageos-prod`
2. Run migrations:
   ```bash
   supabase db push --project-id garageos-prod
   ```
3. Verify tables created:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname='public';
   ```

**Expected tables:**
- auth.users (Supabase built-in)
- vehicles
- maintenance_tasks
- profiles
- user_access
- invitation_tokens
- vehicle_photos (Phase 2)

---

## 🔴 Stage 5: Production Deployment

### 5.1 Deploy to Production

```bash
# Ensure all changes committed
git status  # Should be clean

# Deploy via Vercel
git push origin main  # Auto-deploys if configured

# OR manually:
vercel --prod
```

### 5.2 Verify Production Deployment

```bash
# Check HTTP status
curl -I https://garageos.vercel.app/dashboard

# Test critical endpoints
curl https://garageos.vercel.app/dashboard
curl https://garageos.vercel.app/settings
curl https://garageos.vercel.app/termine

# Should all return 200 OK
```

### 5.3 Smoke Tests in Production

**Test each critical user flow:**

1. **Auth Flow**
   ```
   Go to https://garageos.vercel.app/login
   Login with test account
   Verify redirect to /dashboard
   ```

2. **Guest Invitation Flow**
   ```
   Go to /settings
   Invite new guest (test@example.com)
   Check email for invitation link
   Click link and set password
   Verify guest can login and see only shared vehicles
   ```

3. **User Management**
   ```
   In /settings, revoke a guest's access
   Verify guest can no longer see the vehicle
   ```

4. **Database RLS**
   ```
   Browser DevTools → Application → Local Storage
   Note the user JWT token
   Switch to incognito/different user
   Verify you CANNOT access other user's vehicles
   ```

---

## 📊 Monitoring & Logging

### 5.4 Set Up Monitoring

**Vercel Monitoring:**
1. Dashboard → Deployments → Select production
2. Monitor:
   - Edge Function Performance
   - Serverless Function Duration
   - Error Rate (should be < 0.1%)

**Supabase Monitoring:**
1. Go to Supabase Dashboard
2. Check:
   - Database Connection Health
   - Query Performance
   - RLS Policy Violations (should be 0)

### 5.5 Error Tracking (Optional)

Add Sentry or similar:
```bash
npm install @sentry/nextjs
```

Configure in `next.config.js`:
```javascript
const withSentryConfig = require("@sentry/nextjs/config").default;

module.exports = withSentryConfig(
  {
    // your Next.js config
  },
  {
    org: "your-org",
    project: "garageos",
    authToken: process.env.SENTRY_AUTH_TOKEN,
  }
);
```

---

## 🔄 Rollback Plan

If production breaks:

### 6.1 Immediate Rollback

```bash
# Revert to last working deployment via Vercel Dashboard:
# Deployments → Select previous commit → Promote to Production

# OR via CLI:
vercel rollback
```

### 6.2 Database Rollback

If database migration breaks:

```bash
# Check migration status
supabase migration list

# Rollback last migration
supabase migration repair  # Fix any issues

# Restore from backup (if available)
# Contact Supabase support for point-in-time recovery
```

### 6.3 Communication

Post incident:
1. Notify users of issue + ETA
2. Document what went wrong
3. Update status page
4. Post-mortem: identify prevention for next time

---

## ✅ Post-Deployment Checklist

After successful production deployment:

- [ ] All smoke tests passed
- [ ] Monitoring dashboards show healthy metrics
- [ ] No critical errors in logs
- [ ] Email invitations working
- [ ] RLS policies enforced (verified)
- [ ] Response times < 2s (target)
- [ ] Error rate < 0.1%
- [ ] Uptime > 99.9%
- [ ] Team notified of go-live
- [ ] User documentation up-to-date
- [ ] Runbook created for on-call team

---

## 📚 Environment Variable Checklist

### Staging Required:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅
- `RESEND_API_KEY` ✅
- `NEXT_PUBLIC_APP_URL=https://garageos-staging.vercel.app` ✅
- `NODE_ENV=production` ✅

### Production Required:
- `NEXT_PUBLIC_SUPABASE_URL` ✅ (prod key)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ (prod key)
- `SUPABASE_SERVICE_ROLE_KEY` ✅ (prod key, server-only)
- `RESEND_API_KEY` ✅ (prod key)
- `NEXT_PUBLIC_APP_URL=https://garageos.vercel.app` ✅
- `NODE_ENV=production` ✅

---

## 🔗 Quick Reference

| Environment | URL | Database | Resend Domain |
|-------------|-----|----------|---------------|
| **Local** | http://localhost:3000 | Supabase local | onboarding@resend.dev |
| **Staging** | https://garageos-staging.vercel.app | Supabase staging/prod | onboarding@resend.dev |
| **Production** | https://garageos.vercel.app | Supabase prod | noreply@garageos.de |

---

## 🚨 Common Issues & Solutions

### Issue: "Email not sending"
**Solution:**
1. Check RESEND_API_KEY in Vercel → Settings → Environment Variables
2. Verify API key is valid (not expired)
3. Check email recipient in logs
4. For custom domain: verify DNS records are set

### Issue: "Guest cannot see shared vehicles"
**Solution:**
1. Verify user_access record created
2. Check RLS policy: `SELECT * FROM pg_policies WHERE tablename='user_access'`
3. Test: `SELECT * FROM user_access WHERE guest_user_id = auth.uid()`

### Issue: "Vercel build failing"
**Solution:**
1. Check build logs: Vercel → Deployments → Details
2. Run locally: `npm run build`
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Verify all environment variables set

### Issue: "RLS blocking legitimate queries"
**Solution:**
1. Don't disable RLS (security critical!)
2. Debug query in Supabase SQL Editor
3. Add console.log to check auth.uid() value
4. Update RLS policy if legitimate use case

---

## 📞 Support & Escalation

**Issue Type → Escalation Path:**

| Issue | First Check | Escalation |
|-------|------------|------------|
| Supabase down | supabase.com/status | Supabase Support |
| Vercel build broken | logs in dashboard | Vercel Support |
| Email not sending | RESEND_API_KEY | Resend Support |
| RLS blocking access | pg_policies | Debug RLS policies |
| Performance degradation | Lighthouse audit | Optimize queries |

---

**Letzte Aktualisierung:** 2026-03-23 · **Status:** Staging Ready → Production Ready
