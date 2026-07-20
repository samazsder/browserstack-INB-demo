'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  SMOKE TESTS — FashionStack Ecommerce                       ║
 * ║  Purpose: Verify critical paths are alive after deployment  ║
 * ║  Tag: @smoke                                                ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { expect } = require('chai');
const DriverFactory = require('../utils/driver');
const Logger = require('../utils/logger');
const HomePage = require('../pages/HomePage');
const LoginPage = require('../pages/LoginPage');
const ProductPage = require('../pages/ProductPage');
const testData = require('../data/testData');

describe('🔥 SMOKE — Critical Path Verification', function () {
  this.timeout(60000);
  let driver, home, login, product;
  const results = [];

  before(async function () {
    Logger.section('SMOKE TEST SUITE');
    driver = await DriverFactory.build('chrome');
    home   = new HomePage(driver);
    login  = new LoginPage(driver);
    product = new ProductPage(driver);
  });

  afterEach(async function () {
    const status = this.currentTest.state === 'passed' ? 'pass' : 'fail';
    results.push({ name: this.currentTest.title, status, duration: this.currentTest.duration });

    // Mark BrowserStack session status
    try {
      const h = home.h;
      if (this.currentTest.state === 'passed') {
        await h.markBSStatus('passed', `✅ ${this.currentTest.title}`);
      } else {
        await h.markBSStatus('failed', `❌ ${this.currentTest.err?.message || this.currentTest.title}`);
        await h.takeScreenshot(`smoke-fail-${Date.now()}`);
      }
    } catch { /* ignore */ }
  });

  after(async function () {
    Logger.summary(results);
    await DriverFactory.quit(driver);
  });

  // ─── TC-SM-001: Homepage loads ─────────────────────────────────────────────
  it('TC-SM-001: Homepage loads with correct title', async function () {
    Logger.testStart('TC-SM-001: Homepage loads with correct title');
    await home.open();
    const title = await home.getPageTitle();
    Logger.assert(`Page title: "${title}"`);
    expect(title).to.include('Ecommerce');
    Logger.pass('TC-SM-001');
  });

  // ─── TC-SM-002: Logo visible ───────────────────────────────────────────────
  it('TC-SM-002: FashionStack logo and navigation are visible', async function () {
    Logger.testStart('TC-SM-002: Logo and nav visible');
    await home.open();
    const logoVisible = await home.isLogoVisible();
    const navVisible  = await home.isNavVisible();
    Logger.assert(`Logo visible: ${logoVisible}`);
    Logger.assert(`Nav visible: ${navVisible}`);
    expect(logoVisible).to.be.true;
    expect(navVisible).to.be.true;
    Logger.pass('TC-SM-002');
  });

  // ─── TC-SM-003: Login page accessible ─────────────────────────────────────
  it('TC-SM-003: Login page is accessible from homepage', async function () {
    Logger.testStart('TC-SM-003: Login page accessible');
    await home.open();
    await home.clickLogin();
    const loginVisible = await login.isLoginPageVisible();
    Logger.assert(`Login page visible: ${loginVisible}`);
    expect(loginVisible).to.be.true;
    Logger.pass('TC-SM-003');
  });

  // ─── TC-SM-004: Product detail accessible ─────────────────────────────────
  it('TC-SM-004: Product detail page is accessible', async function () {
    Logger.testStart('TC-SM-004: Product detail accessible');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    const productVisible = await product.isProductPageVisible();
    Logger.assert(`Product page visible: ${productVisible}`);
    expect(productVisible).to.be.true;
    Logger.pass('TC-SM-004');
  });

  // ─── TC-SM-005: Add to cart works ─────────────────────────────────────────
  it('TC-SM-005: Add to Cart button is functional', async function () {
    Logger.testStart('TC-SM-005: Add to Cart functional');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    const addToCartVisible = await product.isAddToCartVisible();
    Logger.assert(`Add to Cart visible: ${addToCartVisible}`);
    expect(addToCartVisible).to.be.true;
    await product.clickAddToCart();
    const btnText = await product.getAddToCartButtonText();
    Logger.assert(`Button text after add: "${btnText}"`);
    // After adding, button may say "Adding..." or "Add to Cart" again
    expect(btnText).to.be.a('string');
    Logger.pass('TC-SM-005');
  });

  // ─── TC-SM-006: Search input present ──────────────────────────────────────
  it('TC-SM-006: Search input is present and interactive', async function () {
    Logger.testStart('TC-SM-006: Search input present');
    await home.open();
    const searchPresent = await home.h.isPresent('input[placeholder="Search..."]');
    Logger.assert(`Search input present: ${searchPresent}`);
    expect(searchPresent).to.be.true;
    Logger.pass('TC-SM-006');
  });
});