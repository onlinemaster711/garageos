# Guest Invitation System Implementation Guide

## Overview
The guest invitation system allows vehicle owners to invite other users via email using Resend. If the invited user doesn't exist, they receive an invitation email and must set a password to activate their account.

## Components Implemented

### 1. Database (supabase/migrations/)

#### `20260323_create_invitation_tokens.sql`
- Creates `invitation_tokens` table with:
  - `token`: Unique invitation token (hexadecimal string)
  - `user_id`: References auth.users (nullable until user claims invitation)
  - `email`: Invited user's email
  - `owner_id`: User who sent the invitation
  - `vehicle_ids`: Array of vehicle UUIDs to grant access to
  - `expires_at`: Token expiration (24 hours from creation)
  - `used_at`: Timestamp when invitation was claimed
  - Indexes on token, user_id, expires_at for fast lookups
  - RLS policies for user and owner access

#### `20260323_create_profiles_table.sql`
- Creates `profiles` table synced from auth.users
- Trigger auto-syncs new/updated auth users
- Enables safe lookup of users by email

### 2. API Routes

#### `POST /api/users/add`
Updated to handle both existing and new users:

**Existing user flow:**
1. Check if email exists in profiles table
2. Create user_access records with can_view=true
3. Return success message

**New user flow:**
1. Generate 32-byte hex token
2. Create invitation_tokens record
3. Send invitation email via Resend
4. Return success message with "isNewUser: true"

#### `GET/POST /api/auth/invite/[token]`

**GET /api/auth/invite/[token]**
- Validates token exists and is not expired
- Returns email and vehicle count

**POST /api/auth/invite/[token]**
- Requires: password (min 8 chars)
- Creates auth user with email and password (via Admin API)
- Creates user_access records for all invited vehicles
- Marks invitation as used and sets user_id
- Returns success with userId

### 3. Client Components

#### `src/lib/resend.ts`
- Resend email utilities
- `sendInvitationEmail(email, token, ownerName)` function
- HTML email template with:
  - Teal gradient header
  - Personalized invitation message
  - Call-to-action button
  - Fallback link in plain text
  - Professional footer

#### `src/app/auth/set-password/[token]/page.tsx`
- Client-side password setup page
- Token validation on mount
- Password input with show/hide toggle
- Confirm password field with validation
- Real-time validation feedback:
  - Minimum 8 characters
  - Password match verification
- Success state with auto-redirect to dashboard
- Error handling for expired/invalid tokens

### 4. Updated Components

#### `src/app/api/users/add/route.ts`
- Checks existing user before sending invitations
- Generates secure random tokens
- Sends emails via Resend
- Proper error handling with cleanup (deletes token if email fails)

## Setup Instructions

### 1. Install Resend Package
```bash
npm install resend
```

### 2. Get Resend API Key
1. Go to https://resend.com
2. Create account or login
3. Get API key from dashboard
4. Add verified sender domain or use Resend's default domain

### 3. Update Environment Variables
Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL
```

**Important:**
- `RESEND_API_KEY` is only used server-side (API routes)
- `NEXT_PUBLIC_APP_URL` is used in email links (must be public-facing in production)

### 4. Deploy Migrations
```bash
supabase db push
```

This will:
- Create `invitation_tokens` table
- Update `profiles` table (if not already created)
- Set up triggers and RLS policies

### 5. Test the Flow

**Invite existing user:**
1. Go to /settings
2. Select vehicle(s)
3. Enter email of existing GarageOS user
4. Click "Benutzer hinzufügen"
5. User should see success message
6. Check user_access table - record should exist

**Invite new user:**
1. Go to /settings
2. Select vehicle(s)
3. Enter email of non-GarageOS user
4. Click "Benutzer hinzufügen"
5. Should see success message: "Einladung an 'email' gesendet..."
6. New user receives email with "Passwort setzen" link
7. Clicking link takes them to /auth/set-password/[token]
8. User enters password twice
9. System creates account and redirects to /dashboard
10. Check auth.users table - user should exist
11. Check user_access table - records should exist

## Workflow Diagram

```
Owner at /settings
    ↓
Selects vehicle(s) + enters email
    ↓
POST /api/users/add
    ↓
┌─────────────────────┬────────────────────┐
│                     │                    │
v                     v                    v
User exists      User not exists       Error
    ↓                ↓                    ↓
Create           Generate token    Delete token +
user_access      + Send email      return error
    ↓                ↓
Return           Return success
success        (invitation sent)
    ↓                ↓
     │         Guest receives email
     │                ↓
     │         Click "Passwort setzen" link
     │                ↓
     │         GET /api/auth/invite/[token]
     │         (validate token)
     │                ↓
     │         /auth/set-password/[token]
     │                ↓
     │         User enters password
     │                ↓
     │         POST /api/auth/invite/[token]
     │                ↓
     │         Create auth.users + user_access
     │                ↓
     │         Mark invitation as used
     │                ↓
     └─────────→ Redirect to /dashboard
                     ↓
              Guest sees shared vehicles
```

## Error Handling

### API Errors
- **401**: Not authenticated - user must be logged in
- **400**: Missing email or vehicles
- **403**: Vehicle doesn't belong to owner
- **404**: User not found (when inviting existing user)
- **409**: User already has access to vehicle
- **500**: Server error (email send failed, database error, etc.)

### Token Validation Errors
- **404**: Token not found
- **410**: Token expired (>24 hours old) or already used
- **400**: Password validation failed

### Email Failures
If email sending fails:
1. Invitation token is automatically deleted
2. API returns 500 error
3. Owner can retry the invitation

## Security Considerations

1. **Tokens**: 32-byte random hex (256 bits entropy)
2. **Expiration**: 24 hours from creation
3. **One-time use**: Tokens are marked as used after password is set
4. **RLS**: Only inviting owner and invitee can see invitation records
5. **Admin API**: Uses service role key for user creation (server-side only)
6. **Password**: Minimum 8 characters, user chooses their own
7. **Email confirmation**: Auto-confirmed for invited users
8. **Vehicle access**: Automatically created with can_view=true, can_edit/upload=false

## Database Schema

### invitation_tokens
```sql
id uuid PRIMARY KEY
token text UNIQUE
user_id uuid (nullable) → auth.users
email text
owner_id uuid → auth.users
vehicle_ids uuid[]
expires_at timestamp
created_at timestamp
used_at timestamp (nullable)
```

## Files Created/Modified

### New Files
- `supabase/migrations/20260323_create_invitation_tokens.sql`
- `supabase/migrations/20260323_create_profiles_table.sql`
- `src/lib/resend.ts`
- `src/app/api/auth/invite/[token]/route.ts`
- `src/app/auth/set-password/[token]/page.tsx`

### Modified Files
- `src/app/api/users/add/route.ts`

## Future Enhancements

1. **Email templates**: Support for HTML/plain text templates
2. **Resend webhooks**: Track email delivery/opens
3. **Invitation expiry management**: Admin panel to revoke invitations
4. **Rate limiting**: Prevent invitation spam
5. **Custom invitation messages**: Owners can add personal message to email
6. **Multi-language emails**: German/English email templates
7. **Password reset flow**: Reuse set-password page for password resets

## Troubleshooting

### Email not sending
- Check `RESEND_API_KEY` is valid
- Verify sender email is verified in Resend dashboard
- Check logs for error details
- Ensure `NEXT_PUBLIC_APP_URL` is correct in emails

### Token validation errors
- Ensure migrations were pushed: `supabase db push`
- Check token hasn't expired (>24 hours)
- Verify token in database: `select * from invitation_tokens where token = '...'`

### User creation fails
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify password requirements (8+ characters)
- Check auth.users table for conflicts

### Profile table not syncing
- Ensure trigger was created: `select trigger_name from information_schema.triggers where table_name='users'`
- Manually sync: `INSERT INTO public.profiles (id, email) SELECT id, email FROM auth.users ON CONFLICT (id) DO NOTHING`
