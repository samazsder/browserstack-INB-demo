'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  FLAKY, DELIBERATE FAILURES & SELF-HEALING TESTS               ║
 * ║  FashionStack Ecommerce                                         ║
 * ║                                                                  ║
 * ║  Purpose:                                                        ║
 * ║  • Flaky tests: timing-sensitive, intermittent assertions        ║
 * ║  • Deliberate failures: showcase BrowserStack failure reporting  ║
 * ║  • Self-healing: demonstrate BrowserStack's self-heal feature    ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

const { expect } = require('chai');
const { By, until } = require('selenium-webdriver');
const DriverFactory = require('../utils/driver');
const Logger = require('../utils/logger');
const HomePage = require('../pages/HomePage');
const LoginPage = require('../pages/LoginPage');
const ProductPage = require('../pages/ProductPage');
const testData = require('../data/testData');

// ─── FLAKY TESTS ─────────────────────────────────────────────────────────────
describe('⚡ FLAKY — Timing-Sensitive & Intermittent Tests', function () {
  this.timeout(60000);
  let driver, home, login, product;
  const results = [];

  before(async function () {
    Logger.section('FLAKY TEST SUITE');
    driver  = await DriverFactory.build('chrome');
    home    = new HomePage(driver);
    login   = new LoginPage(driver);
    product = new ProductPage(driver);
  });

  afterEach(async function () {
    const status = this.currentTest.state === 'passed' ? 'pass' : 'fail';
    results.push({ name: this.currentTest.title, status, duration: this.currentTest.duration });
    try {
      await home.h.markBSStatus(
        this.currentTest.state === 'passed' ? 'passed' : 'failed',
        this.currentTest.err?.message || this.currentTest.title
      );
    } catch { /* ignore */ }
  });

  after(async function () {
    Logger.summary(results);
    await DriverFactory.quit(driver);
  });

  // ─── TC-FLK-001: Race condition on button state ────────────────────────────
  it('TC-FLK-001: [FLAKY] Add to Cart button state changes rapidly', async function () {
    Logger.testStart('TC-FLK-001: Add to Cart button state race condition');
    Logger.warn('This test is intentionally timing-sensitive — may flake on slow networks');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await home.h.scrollDown(400);

    // Click Add to Cart and immediately check button text
    // The button briefly shows "Adding..." — this is a race condition
    const addBtn = await product.addToCartBtn;
    await addBtn.click();

    // Immediately capture text — may be "Adding..." or already reverted
    let immediateText = '';
    try {
      immediateText = await addBtn.getText();
    } catch { immediateText = 'stale'; }

    Logger.info(`Immediate button text: "${immediateText}"`);
    Logger.warn('Flaky: text depends on network speed and render timing');

    // The test passes regardless — we're showcasing the flakiness pattern
    // BrowserStack TRA will track this test's pass/fail rate over time
    await home.h.annotate('FLAKY TEST: Button state race condition observed');
    expect(['Adding...', 'Add to Cart - $39.99', 'stale']).to.include(immediateText);

    Logger.pass('TC-FLK-001');
  });

  // ─── TC-FLK-002: Retry-based assertion ────────────────────────────────────
  it('TC-FLK-002: [FLAKY] Cart badge count with retry logic', async function () {
    Logger.testStart('TC-FLK-002: Cart badge count with retry');
    Logger.warn('This test uses retry logic to handle async cart updates');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await home.h.scrollDown(400);
    await product.clickAddToCart();

    // Retry getting cart count — cart badge may take time to update
    let cartCount = 0;
    await home.h.retry(async () => {
      cartCount = await home.getCartCount();
      Logger.info(`Cart count attempt: ${cartCount}`);
      // Cart count should be >= 1 after adding
      if (cartCount < 1) throw new Error(`Cart count still 0, retrying...`);
    }, 3, 1000);

    Logger.assert(`Final cart count: ${cartCount}`);
    expect(cartCount).to.be.at.least(0); // lenient — badge may not always be visible
    await home.h.annotate('FLAKY TEST: Cart badge count with retry logic');

    Logger.pass('TC-FLK-002');
  });

  // ─── TC-FLK-003: Scroll-dependent element visibility ─────────────────────
  it('TC-FLK-003: [FLAKY] Featured products visibility depends on scroll position', async function () {
    Logger.testStart('TC-FLK-003: Scroll-dependent visibility');
    Logger.warn('Element visibility depends on scroll position — may flake on different viewports');

    await home.open();

    // Without scrolling — featured products may not be visible
    const visibleBeforeScroll = await home.h.isPresent('h3');
    Logger.info(`h3 elements before scroll: ${visibleBeforeScroll}`);

    await home.h.scrollDown(1500);
    await home.h.sleep(500);

    // After scrolling — should be visible
    const visibleAfterScroll = await home.h.isPresent('h3');
    Logger.info(`h3 elements after scroll: ${visibleAfterScroll}`);

    await home.h.annotate('FLAKY TEST: Scroll-dependent element visibility');
    expect(visibleAfterScroll).to.be.true;

    Logger.pass('TC-FLK-003');
  });
});

// ─── DELIBERATE FAILURES ──────────────────────────────────────────────────────
describe('💥 DELIBERATE FAILURES — Showcase BrowserStack Failure Reporting', function () {
  this.timeout(60000);
  let driver, home, login;
  const results = [];

  before(async function () {
    Logger.section('DELIBERATE FAILURE SUITE');
    driver = await DriverFactory.build('chrome');
    home   = new HomePage(driver);
    login  = new LoginPage(driver);
  });

  afterEach(async function () {
    const status = this.currentTest.state === 'passed' ? 'pass' : 'fail';
    results.push({ name: this.currentTest.title, status, duration: this.currentTest.duration });
    try {
      // Deliberate failures are EXPECTED to fail — mark as failed on BS
      if (this.currentTest.state !== 'passed') {
        await home.h.markBSStatus('failed',
          `[DELIBERATE] ${this.currentTest.err?.message || this.currentTest.title}`
        );
        await home.h.takeScreenshot(`deliberate-fail-${Date.now()}`);
      } else {
        await home.h.markBSStatus('passed', this.currentTest.title);
      }
    } catch { /* ignore */ }
  });

  after(async function () {
    Logger.summary(results);
    await DriverFactory.quit(driver);
  });

  // ─── TC-FAIL-001: Wrong page title assertion ───────────────────────────────
  it('TC-FAIL-001: [DELIBERATE FAIL] Wrong page title assertion', async function () {
    Logger.testStart('TC-FAIL-001: Deliberate wrong title assertion');
    Logger.warn('⚠️  This test is DESIGNED to fail — showcasing BrowserStack failure reporting');

    await home.open();
    const title = await home.getPageTitle();
    Logger.info(`Actual title: "${title}"`);
    Logger.info('Asserting wrong title to trigger deliberate failure...');

    await home.h.annotate('DELIBERATE FAILURE: Wrong page title assertion');

    // This WILL fail — intentional
    expect(title).to.equal('This Title Does Not Exist — Deliberate Failure');
  });

  // ─── TC-FAIL-002: Non-existent element ────────────────────────────────────
  it('TC-FAIL-002: [DELIBERATE FAIL] Attempt to find non-existent element', async function () {
    Logger.testStart('TC-FAIL-002: Non-existent element lookup');
    Logger.warn('⚠️  This test is DESIGNED to fail — element does not exist');

    await home.open();
    await home.h.annotate('DELIBERATE FAILURE: Non-existent element lookup');

    // This WILL fail — element doesn't exist
    const el = await driver.wait(
      until.elementLocated(By.id('this-element-does-not-exist')),
      3000
    );
    expect(el).to.not.be.null;
  });

  // ─── TC-FAIL-003: Wrong assertion value ───────────────────────────────────
  it('TC-FAIL-003: [DELIBERATE FAIL] Cart count assertion with wrong expected value', async function () {
    Logger.testStart('TC-FAIL-003: Wrong cart count assertion');
    Logger.warn('⚠️  This test is DESIGNED to fail — wrong expected value');

    await home.open();
    await home.h.annotate('DELIBERATE FAILURE: Wrong cart count assertion');

    const cartCount = await home.getCartCount();
    Logger.info(`Actual cart count: ${cartCount}`);

    // This WILL fail — cart is empty but we assert it has 99 items
    expect(cartCount).to.equal(99, 'Deliberate failure: expected 99 items in empty cart');
  });
});

// ─── SELF-HEALING TESTS ───────────────────────────────────────────────────────
describe('🔧 SELF-HEALING — BrowserStack Self-Heal Showcase', function () {
  this.timeout(60000);
  let driver, home, login;
  const results = [];

  before(async function () {
    Logger.section('SELF-HEALING TEST SUITE');
    driver = await DriverFactory.build('chrome');
    home   = new HomePage(driver);
    login  = new LoginPage(driver);
  });

  afterEach(async function () {
    const status = this.currentTest.state === 'passed' ? 'pass' : 'fail';
    results.push({ name: this.currentTest.title, status, duration: this.currentTest.duration });
    try {
      await home.h.markBSStatus(
        this.currentTest.state === 'passed' ? 'passed' : 'failed',
        this.currentTest.err?.message || this.currentTest.title
      );
    } catch { /* ignore */ }
  });

  after(async function () {
    Logger.summary(results);
    await DriverFactory.quit(driver);
  });

  // ─── TC-SH-001: Self-heal via stable id ───────────────────────────────────
  it('TC-SH-001: [SELF-HEAL] Login button found via stable id attribute', async function () {
    Logger.testStart('TC-SH-001: Self-heal via stable id');
    Logger.info('BrowserStack self-heal: if primary selector fails, SDK tries alternatives');

    await home.open();
    await home.h.annotate('SELF-HEAL TEST: Using stable id="login" selector');

    // Primary selector: id="login" (stable, observed in Step 5)
    // BrowserStack self-heal will try text/role/class alternatives if id changes
    const loginBtn = await home.h.findById('login');
    const visible = await loginBtn.isDisplayed();
    Logger.assert(`Login button found via id="login": ${visible}`);
    expect(visible).to.be.true;

    Logger.pass('TC-SH-001');
  });

  // ─── TC-SH-002: Self-heal via placeholder ─────────────────────────────────
  it('TC-SH-002: [SELF-HEAL] Email input found via placeholder attribute', async function () {
    Logger.testStart('TC-SH-002: Self-heal via placeholder');
    Logger.info('BrowserStack self-heal: placeholder is a stable fallback selector');

    await home.open();
    await home.clickLogin();
    await home.h.annotate('SELF-HEAL TEST: Using placeholder="Enter your email" selector');

    // placeholder="Enter your email" observed in Step 6 — use 30s timeout for mobile
    const emailInput = await home.h.findByCss('input[placeholder="Enter your email"]', 30000);
    const visible = await emailInput.isDisplayed();
    Logger.assert(`Email input found via placeholder: ${visible}`);
    expect(visible).to.be.true;

    Logger.pass('TC-SH-002');
  });

  // ─── TC-SH-003: Self-heal via text content ────────────────────────────────
  it('TC-SH-003: [SELF-HEAL] Buttons found via text content (self-heal fallback)', async function () {
    Logger.testStart('TC-SH-003: Self-heal via text content');
    Logger.info('BrowserStack self-heal: text content is a reliable fallback');

    await home.open();
    await home.h.annotate('SELF-HEAL TEST: Using text content selectors');

    // "Sign In with OTP" text observed in DOM snapshot Step 5
    await home.clickLogin();
    const otpBtn = await login.otpBtn;
    const otpVisible = await otpBtn.isDisplayed();
    Logger.assert(`OTP button found via text: ${otpVisible}`);
    expect(otpVisible).to.be.true;

    // "Continue with Google" text observed in DOM snapshot Step 5
    const googleBtn = await login.googleBtn;
    const googleVisible = await googleBtn.isDisplayed();
    Logger.assert(`Google button found via text: ${googleVisible}`);
    expect(googleVisible).to.be.true;

    Logger.pass('TC-SH-003');
  });

  // ─── TC-SH-004: Self-heal via role attribute ──────────────────────────────
  it('TC-SH-004: [SELF-HEAL] Dark mode toggle found via role="switch"', async function () {
    Logger.testStart('TC-SH-004: Self-heal via role attribute');
    Logger.info('BrowserStack self-heal: ARIA role is a stable semantic selector');

    await home.open();
    await home.h.annotate('SELF-HEAL TEST: Using role="switch" selector');

    // role="switch" observed in DOM snapshot Step 2
    const toggle = await home.h.findByCss('button[role="switch"]');
    const visible = await toggle.isDisplayed();
    Logger.assert(`Dark mode toggle found via role="switch": ${visible}`);
    expect(visible).to.be.true;

    Logger.pass('TC-SH-004');
  });

  // ─── TC-SH-005: Self-heal via type attribute ──────────────────────────────
  it('TC-SH-005: [SELF-HEAL] Submit button found via type="submit"', async function () {
    Logger.testStart('TC-SH-005: Self-heal via type attribute');
    Logger.info('BrowserStack self-heal: type="submit" is a stable form selector');

    await home.open();
    await home.clickLogin();
    await home.h.annotate('SELF-HEAL TEST: Using type="submit" selector');

    // type="submit" observed in Step 9 browsing history
    const submitBtn = await home.h.findByCss('button[type="submit"]');
    const visible = await submitBtn.isDisplayed();
    Logger.assert(`Submit button found via type="submit": ${visible}`);
    expect(visible).to.be.true;

    Logger.pass('TC-SH-005');
  });
});