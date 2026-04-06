# Frontend Critical Path Test Coverage

Date: 2026-04-06
Scope: document-genie frontend
Test runner: Vitest + Testing Library

## Covered Critical Paths

1. Auth
- Test: logs in and stores token
- File: src/test/frontend-critical-paths.test.tsx
- Validates login request, token persistence, and success navigation path.

2. Upload
- Test: accepts valid file and shows queued success state
- File: src/test/frontend-critical-paths.test.tsx
- Validates file selection, upload request, and success UI including job id.

3. Status polling
- Test: queued jobs progress when polling runs
- File: src/test/frontend-critical-paths.test.tsx
- Validates polling transition behavior for queued job states.

4. Results rendering
- Test: shows selected result details and graph panel
- File: src/test/frontend-critical-paths.test.tsx
- Validates result selection, graph panel render, and JSON/CSV actions visibility.

5. Plan limit messaging and billing status
- Test: plan limit messaging appears and upgrade updates billing status
- File: src/test/frontend-critical-paths.test.tsx
- Validates quota warning visibility and plan status upgrade behavior.

## Execution Result

Command:
- npm run test

Outcome:
- Test files: 3 passed
- Tests: 7 passed
- Failures: 0

Notes:
- React Router v7 future-flag warnings appear in test output and are non-blocking.
