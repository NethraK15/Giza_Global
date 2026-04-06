# Staging E2E Verification Report Template

Date:
Verifier (Intern A):
Staging URL:
Build/Release ID:
Backend API version:
AI service version:
Browser set:

## Pre-checks

1. Staging URL reachable
- Result: PASS/FAIL
- Evidence:

2. Backend health endpoint reachable
- Result: PASS/FAIL
- Evidence:

3. Worker processing enabled
- Result: PASS/FAIL
- Evidence:

4. Test users available
- Free user email:
- Paid user email:
- Result: PASS/FAIL
- Evidence:

## Required Flow Matrix (Pass/Fail with Evidence)

1. Public pages (Home, Pricing, About)
- Result: PASS/FAIL
- Evidence:

2. Auth flow (Signup/Login/Forgot)
- Result: PASS/FAIL
- Evidence:

3. Upload flow (PDF/JPG/JPEG/PNG <= 5 MB)
- Result: PASS/FAIL
- Evidence:

4. Job status flow (queued -> processing -> completed/failed)
- Result: PASS/FAIL
- Evidence:

5. Results page (overlay, graph, JSON/CSV/image downloads)
- Result: PASS/FAIL
- Evidence:

6. Billing flow (current plan, usage counters, upgrade)
- Result: PASS/FAIL
- Evidence:

7. Quota enforcement
- Free plan limit enforcement
- Paid plan limit behavior
- Result: PASS/FAIL
- Evidence:

8. Access control
- User can only view own jobs/results
- Result: PASS/FAIL
- Evidence:

## Browser Breakdown

### Chrome
- Public pages: PASS/FAIL
- Auth: PASS/FAIL
- Upload: PASS/FAIL
- Status polling: PASS/FAIL
- Results rendering: PASS/FAIL
- Billing + limit messaging: PASS/FAIL
- Notes:

### Edge
- Public pages: PASS/FAIL
- Auth: PASS/FAIL
- Upload: PASS/FAIL
- Status polling: PASS/FAIL
- Results rendering: PASS/FAIL
- Billing + limit messaging: PASS/FAIL
- Notes:

## Defects Found

1. Defect ID:
- Severity:
- Area:
- Repro steps:
- Expected:
- Actual:
- Status:

## Final Signoff

- Alpha to beta UI is stable on Chrome + Edge: YES/NO
- End-to-end flow is verified by A on staging: YES/NO
- Ready to close roadmap acceptance item: YES/NO
- Signoff by Intern A:
- Signoff date:
