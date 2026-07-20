'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  REGRESSION TESTS — FashionStack Ecommerce                  ║
 * ║  Purpose: Verify existing features haven't broken           ║
 * ║  Tag: @regression                                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { expect } = require('chai');
const DriverFactory = require('../utils/driver');
const Logger = require('../utils/logger');
const HomePage = require('../pages/HomePage');
const LoginPage = require('../pages/LoginPage');
const ProductPage = require('../pages/ProductPage');
const CartPage = require('../pages/CartPage');
const CheckoutPage = require('../pages/CheckoutPage');
const testData = require('../data/testData');

describe('🔄 REGRESSION — Feature Integrity Tests', function () {
  this.timeout(90000);
  let driver, home, login, product, cart, checkout;
  const results = [];

  before(async function () {
    Logger.section('REGRESSION TEST SUITE');
    driver   = await DriverFactory.build('chrome');
    home     = new HomePage(driver);
    login    = new LoginPage(driver);
    product  = new ProductPage(driver);
    cart     = new CartPage(driver);
    checkout = new CheckoutPage(driver);
  });

  afterEach(async function () {
    const status = this.currentTest.state === 'passed' ? 'pass' : 'fail';
    results.push({ name: this.currentTest.title, status, duration: this.currentTest.duration });
    try {
      if (this.currentTest.state !== 'passed') {
        await home.h.markBSStatus('failed', this.currentTest.err?.message || '');
        await home.h.takeScreenshot(`regression-fail-${Date.now()}`);
      } else {
        await home.h.markBSStatus('passed', this.currentTest.title);
      }
    } catch { /* ignore */ }
  });

  after(async function () {
    Logger.summary(results);
    await DriverFactory.quit(driver);
  });

  // ─── TC-REG-001: Page title regression ────────────────────────────────────
  it('TC-REG-001: Homepage title matches expected value', async function () {
    Logger.testStart('TC-REG-001: Homepage title regression');
    await home.open();
    const title = await home.getPageTitle();
    Logger.assert(`Title: "${title}"`);
    // Title observed in DOM snapshot Step 2
    expect(title).to.equal(testData.pageTitle);
    Logger.pass('TC-REG-001');
  });

  // ─── TC-REG-002: Login button ID regression ───────────────────────────────
  it('TC-REG-002: Login button has correct id attribute', async function () {
    Logger.testStart('TC-REG-002: Login button id regression');
    await home.open();
    // id="login" observed in Step 5 browsing history
    const loginBtn = await home.h.findById('login');
    const tagName = await loginBtn.getTagName();
    Logger.assert(`Login element tag: ${tagName}`);
    expect(tagName.toLowerCase()).to.equal('button');
    Logger.pass('TC-REG-002');
  });

  // ─── TC-REG-003: Email input type regression ──────────────────────────────
  it('TC-REG-003: Email input has type="email"', async function () {
    Logger.testStart('TC-REG-003: Email input type regression');
    await home.open();
    await home.clickLogin();
    // type="email" observed in Step 6 — use 30s timeout for mobile
    const emailInput = await home.h.findById('email', 30000);
    const inputType = await emailInput.getAttribute('type');
    Logger.assert(`Email input type: ${inputType}`);
    expect(inputType).to.equal('email');
    Logger.pass('TC-REG-003');
  });

  // ─── TC-REG-004: Password input type regression ───────────────────────────
  it('TC-REG-004: Password input has type="password"', async function () {
    Logger.testStart('TC-REG-004: Password input type regression');
    await home.open();
    await home.clickLogin();
    // type="password" observed in Step 7 — use 30s timeout for mobile
    const pwInput = await home.h.findById('password', 30000);
    const inputType = await pwInput.getAttribute('type');
    Logger.assert(`Password input type: ${inputType}`);
    expect(inputType).to.equal('password');
    Logger.pass('TC-REG-004');
  });

  // ─── TC-REG-005: Product heading regression ───────────────────────────────
  it('TC-REG-005: Essential Cotton Tee product name is correct', async function () {
    Logger.testStart('TC-REG-005: Product name regression');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    const title = await product.getProductTitle();
    Logger.assert(`Product title: "${title}"`);
    expect(title).to.include('Cotton Tee');
    Logger.pass('TC-REG-005');
  });

  // ─── TC-REG-006: Add to Cart button text regression ───────────────────────
  it('TC-REG-006: Add to Cart button contains price', async function () {
    Logger.testStart('TC-REG-006: Add to Cart button text');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await home.h.scrollDown(400);
    const btnText = await product.getAddToCartButtonText();
    Logger.assert(`Add to Cart text: "${btnText}"`);
    // "Add to Cart - $39.99" observed in Step 15 DOM diff
    expect(btnText).to.include('Add to Cart');
    expect(btnText).to.include('$');
    Logger.pass('TC-REG-006');
  });

  // ─── TC-REG-007: Cart heading regression ──────────────────────────────────
  it('TC-REG-007: Cart page heading is "Shopping Cart"', async function () {
    Logger.testStart('TC-REG-007: Cart heading regression');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.clickAddToCart();
    await product.clickViewCart();
    const cartVisible = await cart.isCartPageVisible();
    expect(cartVisible).to.be.true;
    // "Shopping Cart" h1 observed in Step 18 DOM snapshot
    const heading = await cart.cartHeading;
    const headingText = await heading.getText();
    Logger.assert(`Cart heading: "${headingText}"`);
    expect(headingText).to.equal('Shopping Cart');
    Logger.pass('TC-REG-007');
  });

  // ─── TC-REG-008: Checkout sections regression ─────────────────────────────
  it('TC-REG-008: Checkout page has all 3 sections', async function () {
    Logger.testStart('TC-REG-008: Checkout sections regression');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.clickAddToCart();
    await product.clickViewCart();
    await cart.clickProceedToCheckout();

    const contact = await checkout.isContactSectionVisible();
    const shipping = await checkout.isShippingSectionVisible();
    const payment = await checkout.isPaymentSectionVisible();

    Logger.assert(`Contact section: ${contact}`);
    Logger.assert(`Shipping section: ${shipping}`);
    Logger.assert(`Payment section: ${payment}`);

    expect(contact).to.be.true;
    expect(shipping).to.be.true;
    expect(payment).to.be.true;
    Logger.pass('TC-REG-008');
  });

  // ─── TC-REG-009: Search input placeholder regression ──────────────────────
  it('TC-REG-009: Search input placeholder text is correct', async function () {
    Logger.testStart('TC-REG-009: Search placeholder regression');
    await home.open();
    // placeholder="Search..." observed in DOM snapshot Step 2
    const searchInput = await home.h.findByCss('input[placeholder="Search..."]');
    const placeholder = await searchInput.getAttribute('placeholder');
    Logger.assert(`Search placeholder: "${placeholder}"`);
    expect(placeholder).to.equal('Search...');
    Logger.pass('TC-REG-009');
  });

  // ─── TC-REG-010: Dark mode toggle role regression ─────────────────────────
  it('TC-REG-010: Dark mode toggle has role="switch"', async function () {
    Logger.testStart('TC-REG-010: Dark mode toggle role');
    await home.open();
    // role="switch" observed in DOM snapshot Step 2
    const toggle = await home.h.findByCss('button[role="switch"]');
    const role = await toggle.getAttribute('role');
    Logger.assert(`Toggle role: "${role}"`);
    expect(role).to.equal('switch');
    Logger.pass('TC-REG-010');
  });

  // ─── TC-REG-011: Newsletter input regression ──────────────────────────────
  it('TC-REG-011: Newsletter email input is present in footer', async function () {
    Logger.testStart('TC-REG-011: Newsletter input regression');
    await home.open();
    await home.h.scrollToBottom();
    // placeholder="Enter your email address" observed in DOM snapshot Step 4
    const newsletterInput = await home.h.findByCss('input[placeholder="Enter your email address"]');
    const visible = await newsletterInput.isDisplayed();
    Logger.assert(`Newsletter input visible: ${visible}`);
    expect(visible).to.be.true;
    Logger.pass('TC-REG-011');
  });

  // ─── TC-REG-012: Checkout form inputs regression ──────────────────────────
  it('TC-REG-012: Checkout form has all required input fields', async function () {
    Logger.testStart('TC-REG-012: Checkout form inputs regression');
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.clickAddToCart();
    await product.clickViewCart();
    await cart.clickProceedToCheckout();

    // All placeholders observed in Step 20 DOM snapshot
    const fields = [
      'input[placeholder="Email address"]',
      'input[placeholder="First name"]',
      'input[placeholder="Last name"]',
      'input[placeholder="Address"]',
      'input[placeholder="City"]',
      'input[placeholder="ZIP code"]',
      'input[placeholder="Phone"]',
    ];

    for (const selector of fields) {
      const present = await home.h.isPresent(selector);
      Logger.assert(`Field "${selector}": ${present}`);
      expect(present, `Expected field ${selector} to be present`).to.be.true;
    }

    Logger.pass('TC-REG-012');
  });
});