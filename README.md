# FashionStack — Selenium + Node.js Test Suite

> **Full-coverage automated test suite for [FashionStack Ecommerce](https://ecommercebs.vercel.app/) running on BrowserStack Automate with Percy, Accessibility Testing, and Test Reporting & Analytics.**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [BrowserStack SDK Integration](#browserstack-sdk-integration)
6. [Configuration — browserstack.yml](#configuration--browserstackyml)
7. [Running Tests](#running-tests)
8. [Test Suite Coverage](#test-suite-coverage)
9. [Percy Visual Testing](#percy-visual-testing)
10. [Accessibility Testing](#accessibility-testing)
11. [Test Reporting & Analytics (TRA)](#test-reporting--analytics-tra)
12. [Self-Healing](#self-healing)
13. [Detailed Logging](#detailed-logging)
14. [Device & Browser Matrix](#device--browser-matrix)
15. [GitHub Actions — Nightly CI](#github-actions--nightly-ci)
16. [Debugging Failed Tests](#debugging-failed-tests)
17. [Architecture Decisions](#architecture-decisions)

---

## Overview

This project provides a **production-grade Selenium + Node.js test suite** that exercises the full functionality of the FashionStack ecommerce application. It is built to run on **BrowserStack Automate** using the **BrowserStack Node.js SDK**, which provides:

- ✅ Parallel execution across 5 browser/device combinations
- 📸 Percy visual regression snapshots
- ♿ Automated accessibility (WCAG 2.1 AA) scanning
- 📊 Test Reporting & Analytics (TRA) with build-level insights
- 🔧 Self-healing selectors
- 🎥 Video, network, and console log capture
- 🌙 Nightly GitHub Actions CI trigger

---

## Project Structure

```
fashionstack-selenium-nodejs/
├── .github/
│   └── workflows/
│       └── nightly.yml          # GitHub Actions nightly CI
├── test/
│   ├── data/
│   │   └── testData.js          # Centralised test data
│   ├── pages/                   # Page Object Model
│   │   ├── HomePage.js
│   │   ├── LoginPage.js
│   │   ├── ProductPage.js
│   │   ├── CartPage.js
│   │   └── CheckoutPage.js
│   ├── specs/                   # Test specifications
│   │   ├── smoke.spec.js        # @smoke — 6 critical path tests
│   │   ├── sanity.spec.js       # @sanity — 8 core UI tests
│   │   ├── e2e.spec.js          # @e2e — 8 full journey tests
│   │   ├── regression.spec.js   # @regression — 12 regression tests
│   │   └── flaky.spec.js        # Flaky + deliberate failures + self-heal
│   └── utils/
│       ├── driver.js            # WebDriver factory
│       ├── helpers.js           # Reusable Selenium utilities
│       └── logger.js            # Beautiful console logger
├── browserstack.yml             # BrowserStack SDK configuration
├── package.json
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js     | ≥ 16.0.0 |
| npm         | ≥ 8.0.0 |
| BrowserStack account | [Sign up free](https://www.browserstack.com/users/sign_up) |

---

## Installation

```bash
# Clone or navigate to the project
cd fashionstack-selenium-nodejs

# Install all dependencies
npm install
```

---

## BrowserStack SDK Integration

This project uses the **BrowserStack Node.js SDK** (`browserstack-node-sdk`) which wraps your test runner and handles:

1. **Credential injection** — reads `userName` and `accessKey` from `browserstack.yml`
2. **Capability management** — maps `browsers[]` config to WebDriver capabilities automatically
3. **Parallel execution** — spawns parallel sessions per `parallelsPerPlatform`
4. **Feature activation** — enables Percy, Accessibility, TRA, self-heal via YAML flags
5. **Session marking** — SDK intercepts `browserstack_executor` JS calls for pass/fail status

### How the SDK wraps Mocha

```bash
# Without SDK (local):
mocha 'test/specs/**/*.spec.js'

# With SDK (BrowserStack):
browserstack-node-sdk mocha 'test/specs/**/*.spec.js'
```

The SDK patches `selenium-webdriver`'s `Builder` class at runtime, so your test code requires **zero changes** — the same `new Builder().forBrowser('chrome').build()` call connects to BrowserStack's cloud grid instead of a local driver.

### Session Status Marking

Each test marks its BrowserStack session status via JavaScript executor:

```javascript
await driver.executeScript(
  `browserstack_executor: ${JSON.stringify({
    action: 'setSessionStatus',
    arguments: { status: 'passed', reason: 'Test passed successfully' }
  })}`
);
```

This powers the pass/fail indicators in the BrowserStack Automate dashboard and TRA.

---

## Configuration — browserstack.yml

The `browserstack.yml` file is the single source of truth for all BrowserStack features:

```yaml
# Credentials
userName: <your-username>
accessKey: <your-access-key>

# Project metadata
projectName: FashionStack Ecommerce
buildName: "FashionStack Full Suite - ${BUILD_ID:-local}"

# 5 browser/device combinations
browsers:
  - browser: chrome          # Fixed: Desktop Chrome (Percy baseline)
    browser_version: latest
    os: Windows
    os_version: 11

  - device: Samsung Galaxy S23   # Fixed: Mobile Chrome (Percy mobile)
    os_version: 13.0
    browser: chrome

  - browser: firefox         # Dynamic combo 1
    browser_version: latest
    os: Windows
    os_version: 10

  - browser: safari          # Dynamic combo 2
    browser_version: latest
    os: OS X
    os_version: Ventura

  - device: iPhone 14        # Dynamic combo 3
    os_version: 16
    browser: safari

# Feature flags
percy: true                  # Visual regression
accessibility: true          # WCAG 2.1 AA scanning
testObservability: true      # TRA dashboard
selfHeal: true               # Self-healing selectors
debug: true                  # Verbose session logs
networkLogs: true            # Network traffic capture
consoleLogs: verbose         # Browser console logs
seleniumLogs: true           # Selenium command logs
videoLogs: true              # Session video recording
```

### Key Configuration Options

| Option | Value | Purpose |
|--------|-------|---------|
| `percy` | `true` | Enables Percy visual snapshots |
| `accessibility` | `true` | Runs WCAG 2.1 AA accessibility scan |
| `testObservability` | `true` | Sends results to TRA dashboard |
| `selfHeal` | `true` | Auto-heals broken selectors |
| `networkLogs` | `true` | Captures all network requests |
| `consoleLogs` | `verbose` | Captures all browser console output |
| `videoLogs` | `true` | Records full session video |
| `debug` | `true` | Enables verbose BrowserStack debug logs |

---

## Running Tests

### Local (Chrome only)

```bash
# All tests
npm test

# Specific suites
npm run test:smoke
npm run test:sanity
npm run test:e2e
npm run test:regression
npm run test:flaky
```

### BrowserStack Automate (all 5 combinations)

```bash
# Full suite across all 5 browser/device combos
npm run test:browserstack

# Smoke only (fast gate)
npm run test:browserstack:smoke

# E2E only
npm run test:browserstack:e2e
```

### With custom build name

```bash
BUILD_ID=my-feature-branch npm run test:browserstack
```

### Enable verbose debug logging

```bash
DEBUG_LOGS=true npm run test:browserstack
```

---

## Test Suite Coverage

### 🔥 Smoke Tests (`smoke.spec.js`) — 6 tests

| ID | Test | Purpose |
|----|------|---------|
| TC-SM-001 | Homepage loads with correct title | Verify deployment is live |
| TC-SM-002 | Logo and navigation visible | Critical UI elements present |
| TC-SM-003 | Login page accessible | Auth flow entry point works |
| TC-SM-004 | Product detail accessible | Product browsing works |
| TC-SM-005 | Add to Cart functional | Core commerce action works |
| TC-SM-006 | Search input present | Search feature available |

### 🧪 Sanity Tests (`sanity.spec.js`) — 8 tests

| ID | Test | Purpose |
|----|------|---------|
| TC-SN-001 | All nav categories present | Navigation integrity |
| TC-SN-002 | Dark mode toggle functional | UI feature works |
| TC-SN-003 | Login form has all fields | Form completeness |
| TC-SN-004 | Invalid login shows error | Error handling |
| TC-SN-005 | Product detail shows size/cart | Product page elements |
| TC-SN-006 | Cart shows summary and checkout | Cart page elements |
| TC-SN-007 | Social login options visible | OAuth entry points |
| TC-SN-008 | Footer shows service highlights | Footer content |

### 🚀 E2E Tests (`e2e.spec.js`) — 8 tests

| ID | Test | Purpose |
|----|------|---------|
| TC-E2E-001 | Complete browse-to-checkout journey | Full happy path with Percy |
| TC-E2E-002 | Login flow with invalid credentials | Auth error handling |
| TC-E2E-003 | Add multiple products to cart | Multi-item cart |
| TC-E2E-004 | Search for products | Search functionality |
| TC-E2E-005 | Navigation category clicks | Category browsing |
| TC-E2E-006 | All size options selectable | Size selection UX |
| TC-E2E-007 | Back navigation returns to homepage | Navigation flow |
| TC-E2E-008 | Continue Shopping from cart | Cart exit flow |

### 🔄 Regression Tests (`regression.spec.js`) — 12 tests

| ID | Test | Purpose |
|----|------|---------|
| TC-REG-001 | Homepage title matches expected | Title regression |
| TC-REG-002 | Login button has correct id | Attribute regression |
| TC-REG-003 | Email input has type="email" | Input type regression |
| TC-REG-004 | Password input has type="password" | Input type regression |
| TC-REG-005 | Product name is correct | Content regression |
| TC-REG-006 | Add to Cart button contains price | Button text regression |
| TC-REG-007 | Cart heading is "Shopping Cart" | Heading regression |
| TC-REG-008 | Checkout has all 3 sections | Section regression |
| TC-REG-009 | Search placeholder text correct | Placeholder regression |
| TC-REG-010 | Dark mode toggle has role="switch" | ARIA regression |
| TC-REG-011 | Newsletter input in footer | Footer regression |
| TC-REG-012 | Checkout form has all inputs | Form regression |

### ⚡💥🔧 Flaky / Failures / Self-Heal (`flaky.spec.js`) — 11 tests

| ID | Test | Type |
|----|------|------|
| TC-FLK-001 | Add to Cart button state race condition | Flaky |
| TC-FLK-002 | Cart badge count with retry logic | Flaky |
| TC-FLK-003 | Scroll-dependent element visibility | Flaky |
| TC-FAIL-001 | Wrong page title assertion | Deliberate Failure |
| TC-FAIL-002 | Non-existent element lookup | Deliberate Failure |
| TC-FAIL-003 | Wrong cart count assertion | Deliberate Failure |
| TC-SH-001 | Login button via stable id | Self-Heal |
| TC-SH-002 | Email input via placeholder | Self-Heal |
| TC-SH-003 | Buttons via text content | Self-Heal |
| TC-SH-004 | Dark mode toggle via role | Self-Heal |
| TC-SH-005 | Submit button via type | Self-Heal |

**Total: 45 tests across 5 spec files**

---

## Percy Visual Testing

Percy snapshots are taken at key points in the E2E journey:

| Snapshot Name | Location in Test |
|---------------|-----------------|
| `Homepage - Desktop` | TC-E2E-001: After homepage loads |
| `Product Detail - Essential Cotton Tee` | TC-E2E-001: After product page loads |
| `Shopping Cart` | TC-E2E-001: After adding item to cart |
| `Checkout Page` | TC-E2E-001: After proceeding to checkout |
| `Login Page` | TC-E2E-002: After login page loads |

### Percy Baseline Browsers

Two combinations are **fixed** (not dynamic) to ensure consistent Percy baselines:

1. **Desktop Chrome** — Windows 11, Chrome latest
2. **Mobile Chrome** — Samsung Galaxy S23, Android 13

These provide stable visual comparison points across nightly runs.

### How Percy Works

```javascript
// In test code (via helpers.js)
await home.h.percySnapshot('Homepage - Desktop');

// Internally calls:
const percySnapshot = require('@percy/selenium-webdriver');
await percySnapshot(driver, 'Homepage - Desktop');
```

Percy captures a DOM snapshot (not a screenshot) and renders it in its own infrastructure for pixel-perfect comparison. The `percy: true` flag in `browserstack.yml` activates Percy integration automatically.

---

## Accessibility Testing

Accessibility scanning is enabled via `accessibility: true` in `browserstack.yml`.

### Configuration

```yaml
accessibility: true
accessibilityOptions:
  wcagVersion: wcag21aa        # WCAG 2.1 Level AA
  includeIssueType:
    bestPractice: true         # Include best practice violations
    needsReview: true          # Include needs-review items
```

### What Gets Scanned

BrowserStack Accessibility Testing automatically scans every page visited during a test session and reports:

- **Critical** — Must fix (e.g. missing alt text, insufficient colour contrast)
- **Serious** — Should fix (e.g. missing form labels)
- **Moderate** — Consider fixing (e.g. redundant links)
- **Minor** — Nice to fix (e.g. missing lang attribute)

Results appear in the **BrowserStack Accessibility dashboard** linked from each session.

---

## Test Reporting & Analytics (TRA)

TRA is enabled via `testObservability: true` in `browserstack.yml`.

### What TRA Provides

| Feature | Description |
|---------|-------------|
| **Build overview** | Pass/fail/skip counts per build |
| **Flaky test detection** | Automatically identifies tests that pass and fail intermittently |
| **Failure analysis** | Groups failures by root cause |
| **Test history** | Trend charts across nightly builds |
| **Session links** | Direct links from test results to BrowserStack sessions |

### Accessing TRA

1. Go to [BrowserStack Test Observability](https://observability.browserstack.com)
2. Select project: **FashionStack Ecommerce**
3. View builds named `FashionStack Full Suite - <build-number>`

### Build Naming

Build names include the CI run number for traceability:

```yaml
buildName: "FashionStack Full Suite - ${BUILD_ID:-local}"
```

In GitHub Actions, `BUILD_ID` is set to `${{ github.run_number }}`.

---

## Self-Healing

Self-healing is enabled via `selfHeal: true` in `browserstack.yml`.

### How It Works

When a selector fails to locate an element, BrowserStack's self-heal engine:

1. Analyses the DOM at the point of failure
2. Tries alternative selectors (id → data-testid → role → text → class)
3. If a match is found, continues the test and logs the healed selector
4. Reports the suggested fix in the TRA dashboard

### Self-Heal Test Cases

The `TC-SH-*` tests in `flaky.spec.js` demonstrate the selector hierarchy:

```
id="login"                    → Most stable (TC-SH-001)
placeholder="Enter your email" → Stable attribute (TC-SH-002)
text content "Sign In with OTP" → Semantic fallback (TC-SH-003)
role="switch"                 → ARIA role fallback (TC-SH-004)
type="submit"                 → Form attribute fallback (TC-SH-005)
```

---

## Detailed Logging

The custom `Logger` utility (`test/utils/logger.js`) provides beautiful, colour-coded console output:

```
═══════════════════════════════════════════════════════════════════════
  SMOKE TEST SUITE
═══════════════════════════════════════════════════════════════════════

📋 SUITE: 🔥 SMOKE — Critical Path Verification
   Started: 2024-01-15 01:10:23.456

  ▶ TEST: TC-SM-001: Homepage loads with correct title
    2024-01-15 01:10:23.789
    ⚙  Opening FashionStack homepage
    ✓  Page title: "Ecommerce Clothing Brand Homepage (Community)"
  ✅ PASS: TC-SM-001 (2341ms)

  ▶ TEST: TC-SM-002: FashionStack logo and navigation are visible
  ❌ FAIL: TC-SM-002
     Error: Expected false to be true

──────────────────────────────────────────────────────────────────────
  TEST SUMMARY
──────────────────────────────────────────────────────────────────────
  ✅  TC-SM-001: Homepage loads...                    2341ms
  ❌  TC-SM-002: Logo and nav visible                 1205ms
──────────────────────────────────────────────────────────────────────
  Passed: 1  Failed: 1  Skipped: 0
──────────────────────────────────────────────────────────────────────
```

### Log Levels

| Symbol | Level | When Used |
|--------|-------|-----------|
| `⚙` | Step | Each test action |
| `✓` | Assert | Each assertion that passes |
| `✅` | Pass | Test passed |
| `❌` | Fail | Test failed |
| `⚠️` | Warn | Non-fatal warnings |
| `ℹ️` | Info | Informational messages |
| `🔍` | Debug | Verbose (set `DEBUG_LOGS=true`) |
| `📸` | Percy | Percy snapshot taken |
| `🔗` | BS Session | BrowserStack session link |

---

## Device & Browser Matrix

| # | Type | Browser | OS/Device | Version | Percy? |
|---|------|---------|-----------|---------|--------|
| 1 | Desktop | Chrome | Windows 11 | Latest | ✅ Fixed |
| 2 | Mobile | Chrome | Samsung Galaxy S23 | Android 13 | ✅ Fixed |
| 3 | Desktop | Firefox | Windows 10 | Latest | Dynamic |
| 4 | Desktop | Safari | macOS Ventura | Latest | Dynamic |
| 5 | Mobile | Safari | iPhone 14 | iOS 16 | Dynamic |

**Combinations 1 & 2 are fixed** to provide stable Percy visual baselines.  
**Combinations 3–5 are dynamic** to provide varied cross-browser/device coverage in TRA reports.

---

## GitHub Actions — Nightly CI

The workflow at `.github/workflows/nightly.yml` runs every night at **01:10 AM UTC**.

### Schedule

```yaml
on:
  schedule:
    - cron: '10 1 * * *'   # 01:10 AM UTC daily
  workflow_dispatch:         # Manual trigger with suite selection
```

### Jobs

```
smoke ──────────────────────────────────────────────────────► Pass/Fail
  │
  └── full-suite (depends on smoke) ──────────────────────────► Pass/Fail
        │
        └── notify (on failure) ──────────────────────────────► GitHub error
```

### Required GitHub Secrets

Add these in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `BROWSERSTACK_USERNAME` | Your BrowserStack username |
| `BROWSERSTACK_ACCESS_KEY` | Your BrowserStack access key |

### Manual Trigger

You can trigger the workflow manually from the **Actions** tab with a specific suite:

- `all` — Full suite (default)
- `smoke` — Smoke only
- `sanity` — Sanity only
- `e2e` — E2E only
- `regression` — Regression only
- `flaky` — Flaky/failure/self-heal only

---

## Debugging Failed Tests

### 1. BrowserStack Session Video

Every session is recorded. Find the video in:
- **BrowserStack Automate** → Your build → Click the failed test → **Video** tab

### 2. Network Logs

Network traffic is captured (`networkLogs: true`). View in:
- **BrowserStack Automate** → Session → **Network** tab

### 3. Console Logs

Browser console output is captured (`consoleLogs: verbose`). View in:
- **BrowserStack Automate** → Session → **Console** tab

### 4. Local Screenshots

Failed tests save screenshots to `reports/screenshots/`:

```bash
ls reports/screenshots/
# smoke-fail-1705276823456.png
# e2e-fail-1705276891234.png
```

### 5. TRA Failure Analysis

BrowserStack TRA groups failures by root cause:
- **Selector failures** → Self-heal suggestions
- **Timeout failures** → Network/performance issues
- **Assertion failures** → Application bugs

### 6. Re-run a specific test locally

```bash
# Run a single spec file
npx mocha 'test/specs/smoke.spec.js' --timeout 60000

# Run a specific test by name
npx mocha 'test/specs/regression.spec.js' --grep "TC-REG-001" --timeout 60000
```

---

## Architecture Decisions

### Page Object Model (POM)

All page interactions are encapsulated in `test/pages/`. Tests never contain raw selectors — they call page object methods. This means:
- Selector changes require updates in **one place only**
- Tests read like plain English
- Page objects are reusable across test suites

### Selector Strategy (Stability Hierarchy)

Selectors are chosen in this priority order (most → least stable):

```
1. id attribute          (#email, #login)
2. type attribute        (input[type="email"])
3. placeholder attribute (input[placeholder="Search..."])
4. role attribute        (button[role="switch"])
5. Text content          (findByText('Sign In', 'button'))
6. XPath with text       (//h3[contains(text(),'Color')])
```

### BrowserStack SDK vs. Direct Capabilities

This project uses the **SDK approach** (not direct `DesiredCapabilities`). Benefits:
- No capability boilerplate in test code
- Single `browserstack.yml` controls everything
- Percy/Accessibility/TRA activated by YAML flags, not code
- Self-heal works transparently

### Retry Logic

Flaky network-dependent assertions use `helpers.retry()`:

```javascript
await h.retry(async () => {
  const count = await getCartCount();
  if (count < 1) throw new Error('Not updated yet');
}, 3, 1000); // 3 attempts, 1s delay
```

This prevents false failures from transient network delays without masking real bugs.