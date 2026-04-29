# SaaS Admin / Demo Guide

Use this guide to create demo users and verify the subscription and quota flows in the Document Genie frontend.

## 1. Create Test Free User

Option A: Use the built-in demo account

- Open the app at `http://localhost:5173`
- Go to `/auth/login`
- Sign in with:
  - Email: `demo@giza.ai`
  - Password: `password123`
- You will land in the dashboard as a free-plan user by default.

Option B: Create a new free user

- Go to `/auth/signup`
- Enter a name, email, and password
- Click `Create account`
- The account starts on the free plan automatically

## 2. Create Test Paid User

- Sign up a new user at `/auth/signup` or log in with a test account
- Go to `/dashboard/billing`
- Click `Upgrade to Paid`
- Wait for the button to change to `Current Plan Active`
- Confirm the plan now shows `Paid Plan`

If the backend is unavailable, the UI keeps the paid state locally for demo purposes.

## 3. Verify Quotas and Billing States

### Free Plan Checks

- Go to `/dashboard`
- Confirm the plan badge shows `Free Plan`
- Confirm the usage card shows a daily limit
- If usage is near the limit, the warning banner should appear
- Go to `/dashboard/billing`
- Confirm the plan section shows `Free Plan`
- Confirm the action button says `Upgrade to Paid`

### Paid Plan Checks

- After upgrading, return to `/dashboard`
- Confirm the plan badge shows `Paid Plan`
- Confirm the usage card switches to a monthly window
- Go to `/dashboard/billing`
- Confirm the plan section shows `Paid Plan`
- Confirm the action button says `Current Plan Active`

### Quota Behavior

- Free users should see daily quota messaging
- Paid users should see monthly quota messaging
- Upload limits are enforced at 5 MB per file
- Allowed file types are PDF, JPG, JPEG, and PNG

## Demo Flow

1. Sign in as the demo free user
2. Open the dashboard and show the current quota state
3. Open Billing and show the upgrade action
4. Upgrade to paid and confirm the updated billing state
5. Return to Dashboard and confirm the paid-plan quota view

## Notes

- Token state is stored in `document-genie-token`
- Billing usage state is stored in `document-genie-usage`
- The mock API server runs on `http://localhost:4000`
- The frontend dev server runs on `http://localhost:5173`
