# QA Practice Lab

A job-application page with **risk-based Playwright tests** (UI + API) that run on every push in GitHub Actions.

The product is small on purpose. The portfolio point is **what I chose to test at which layer, what I skipped, and that CI—not my laptop—is the real run.**

Test strategy (scope, risks, entry/exit, skip list): [docs/Test-Strategy.pptx](docs/Test-Strategy.pptx).

[![Playwright](https://github.com/shenling0614/QaPracticeLab/actions/workflows/playwright.yml/badge.svg)](https://github.com/shenling0614/QaPracticeLab/actions/workflows/playwright.yml)

## How to run

```powershell
git clone https://github.com/shenling0614/QaPracticeLab.git
cd QaPracticeLab
npm install
npx playwright install chromium
npm test
```

Tests start `node server.mjs` on port `4173`. Open the app: [http://127.0.0.1:4173](http://127.0.0.1:4173).

To run the app without tests: `npm start`.

If a test fails:

```powershell
npm run test:report
```

Open the failed test, then **trace**. Debug from the trace; do not re-run until it happens to pass.

## API vs UI (why a check lives where it does)

`POST /api/applications` is the source of truth for create, validation, and duplicate email. The browser only adds what the user **sees**.

| Layer | What belongs there |
|---|---|
| **API** (`tests/api.spec.ts`) | Status codes, error lists, duplicate/`trim`/role rules without a browser |
| **UI** (`tests/apply.spec.ts`) | Messages on the page, client validation before submit, one E2E success, one E2E duplicate (API error rendered) |

I moved duplicate letter-case and “role omitted” **off the UI suite**. Empty form still covers “Role is required” on screen. Case-insensitive duplicate is an API rule.

## What I tested (and why)

### API

| Test | Risk |
|---|---|
| `201` + confirmation `QA-1001` | Create must work |
| `400` missing name, email, role | Contract for empty body |
| `400` invalid email | Format is enforced on the server |
| `400` whitespace-only name | `trim` is not only a UI trick |
| `400` missing role | Incomplete payload must fail |
| `409` `applied@example.com` | Already-applied |
| `409` `Applied@Example.com` | Same person, different case |

### UI

| Test | Risk |
|---|---|
| Valid submit → confirmation | E2E smoke (browser + API) |
| Empty form → all required messages | Client validation; no API call |
| Missing name + invalid email | Two messages on screen |
| Whitespace-only name | Client `trim` |
| Duplicate email shown on the page | UI displays the API `409` |
| Fix validation errors, then succeed | An error must not trap the form |

Locators: `getByLabel` and `getByRole` in `tests/fixtures.ts`. Success tests use `uniqueEmail()` so parallel runs do not collide in the in-memory store. No `waitForTimeout`.

## What I did not automate (yet)

- Accessibility (Week 9)
- Every empty-field combination
- Extra browsers (Chromium only)
- Auth, persistence, or a real database (emails live in server memory)

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
server.mjs                       Static page + POST /api/applications
index.html                       Job application form (calls the API)
styles.css                       Layout
docs/Test-Strategy.pptx            Scope, product/test/CI architecture, risks, go/no-go
tests/fixtures.ts                UI locators + fill helper
tests/apply.spec.ts              UI tests
tests/api.spec.ts                Playwright request tests
playwright.config.ts             Chromium, trace on failure, starts server.mjs
.github/workflows/playwright.yml GitHub Actions
```

## 3-minute walkthrough (practice out loud)

1. **What it is** — a form plus an API; green CI on GitHub.
2. **Strategy** — `docs/Test-Strategy.pptx`: risks, API vs UI, what we skip.
3. **Layering** — duplicate and status codes are API tests; the page is for what the user sees.
4. **Happy path** — UI smoke + API `201`.
5. **Fixture** — `goto` and locators in `fixtures.ts`.
6. **Failure** — Actions artifact + trace. Go/no-go is in the strategy exit criteria.
