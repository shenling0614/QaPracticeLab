# QA Practice Lab

A small job-application page plus Playwright tests. Week 3: **tests run in GitHub Actions**, not only on this PC.

[![Playwright](https://github.com/shenling0614/QaPracticeLab/actions/workflows/playwright.yml/badge.svg)](https://github.com/shenling0614/QaPracticeLab/actions/workflows/playwright.yml)

The badge turns green after the first successful run on GitHub. If the repo name on GitHub is different, change `QaPracticeLab` in that URL.

## How to run locally

```powershell
cd QaPracticeLab
npm install
npx playwright install chromium
npm test
```

The tests start a local server on port `4173`. Open the app at [http://127.0.0.1:4173](http://127.0.0.1:4173).

If a test fails locally, open the report:

```powershell
npm run test:report
```

Click the failed test, then **trace**.

## CI (GitHub Actions)

This is the same idea as Jenkins regression at Ericsson: a pipeline on a clean machine, not your laptop.

| Piece | Where |
|---|---|
| Pipeline file | `.github/workflows/playwright.yml` |
| When it runs | Every push and pull request to `main` |
| What it does | `npm ci` → install Chromium → `npx playwright test` |
| Secrets | None. This app has no passwords or API keys. |
| Report | Actions → the run → **playwright-report** artifact |
| Traces | Uploaded only when tests **fail** (`test-results`) |

A failed job is useful. Download the report artifact, unzip it, run `npx playwright show-report` in that folder (or open `index.html`), and read the trace the same way as Week 2.

## What I chose to test (and why)

Eight UI tests. Each one has a reason to exist. I did **not** add a separate success test per role.

| Test | Risk |
|---|---|
| Valid submit shows confirmation `QA-1001` | Happy path must work |
| Empty form shows all required messages | Clicking Submit with nothing filled must not succeed |
| Missing name + invalid email | Two client errors at once; still no confirmation |
| Whitespace-only name | Spaces are not a name (`trim`) |
| Role not selected | Incomplete application must fail |
| Duplicate email `applied@example.com` | Already-applied must fail |
| Duplicate email with different letter case | `Applied@Example.com` is the same person |
| Fix validation errors, then succeed | An error must not trap the form |

What I did **not** automate yet: accessibility or API tests. Those come in later weeks.

## Folder map

```
index.html                      Job application page
styles.css                      Page layout
tests/fixtures.ts               Shared locators and fill helper
tests/apply.spec.ts             Eight Playwright tests
playwright.config.ts            Chromium, screenshot + trace on failure, CI retries
.github/workflows/playwright.yml  GitHub Actions pipeline
```

Locators use `getByLabel` and `getByRole`. There is no `waitForTimeout`.
