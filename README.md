# QA Practice Lab

A job-application page with **risk-based Playwright tests** that run on every push in GitHub Actions.

The product is small on purpose. The portfolio point is **what I chose to test, what I skipped, and that CI—not my laptop—is the real run.**

[![Playwright](https://github.com/shenling0614/QaPracticeLab/actions/workflows/playwright.yml/badge.svg)](https://github.com/shenling0614/QaPracticeLab/actions/workflows/playwright.yml)

## How to run

```powershell
git clone https://github.com/shenling0614/QaPracticeLab.git
cd QaPracticeLab
npm install
npx playwright install chromium
npm test
```

Tests start a local server on port `4173`. Open the app: [http://127.0.0.1:4173](http://127.0.0.1:4173).

If a test fails:

```powershell
npm run test:report
```

Open the failed test, then **trace**. Debug from the trace; do not re-run until it happens to pass.

## What I tested (and why)

Eight UI tests. Each exists for a risk. There is **no** extra success test per role (QA Engineer vs QA Lead vs SDET is the same path).

| Test | Risk |
|---|---|
| Valid submit → confirmation `QA-1001` | Happy path must work |
| Empty form → all required messages | Submit with nothing filled must not succeed |
| Missing name + invalid email | Two client errors at once; still no confirmation |
| Whitespace-only name | Spaces are not a name (`trim`) |
| Role not selected | Incomplete application must fail |
| Duplicate email `applied@example.com` | Already-applied must fail |
| Duplicate email, different letter case | `Applied@Example.com` is the same person |
| Fix validation errors, then succeed | An error must not trap the form |

Locators: `getByLabel` and `getByRole` in `tests/fixtures.ts`. Specs describe behavior; the fixture opens `/` and holds locators. No `waitForTimeout`.

## What I did not automate (yet)

- API tests (the page is still client-only; Week 5)
- Accessibility (Week 9)
- Every empty-field combination
- Extra browsers (Chromium only)

Skipping those is a **coverage decision**, not a missing install.

## CI

Same idea as a Jenkins regression job: a clean machine, not this PC.

| Piece | Where |
|---|---|
| Pipeline | `.github/workflows/playwright.yml` |
| When | Push and pull request to `main` |
| Steps | `npm ci` → Chromium → `npx playwright test` |
| Secrets | None |
| Report | Actions → run → artifact **playwright-report** |
| Traces | Artifact **test-results** only if tests **fail** |

A red run still keeps the code on GitHub. Fix locally, then push; a **new** run starts.

## Folder map

```
index.html                       Job application page
styles.css                       Layout
tests/fixtures.ts                Shared locators + fill helper
tests/apply.spec.ts              Eight tests
playwright.config.ts             Chromium, trace/screenshot on failure, CI retries
.github/workflows/playwright.yml GitHub Actions
```

## 3-minute walkthrough (practice out loud)

Do not read this file in an interview. Use it as a checklist:

1. **What it is** — a form I quality-engineered; green CI on GitHub.
2. **Happy path** — valid name, email, role → `QA-1001`.
3. **Why not 50 tests** — one test per risk; I skipped per-role success.
4. **Fixture** — `goto` and locators live in `fixtures.ts`; specs stay about risk.
5. **Failure** — Actions artifact + trace, same as a failed Jenkins job.
6. **Next** — API and accessibility later; I can say what I would add under time pressure.
