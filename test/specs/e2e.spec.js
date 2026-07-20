'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  END-TO-END TESTS — FashionStack Ecommerce                  ║
 * ║  Purpose: Full user journey coverage with Percy snapshots   ║
 * ║  Optimised: lean flows, minimal sleeps, 90s per-test cap    ║
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

describe('🚀 E2E — Full User Journey Tests', function () {
  this.timeout(90000);
  let driver, home, login, product, cart, checkout;
  const results = [];

  before(async function () {
    Logger.section('END-TO-END TEST SUITE');
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
        await home.h.markBSStatus('failed', this.currentTest.err?.message?.substring(0, 200) || '');
        await home.h.takeScreenshot(`e2e-fail-${Date.now()}`);
      } else {
        await home.h.markBSStatus('passed', this.currentTest.title);
      }
    } catch { /* ignore */ }
  });

  after(async function () {
    Logger.summary(results);
    await DriverFactory.quit(driver);
  });

  // ─── TC-E2E-001: Homepage → Product → Cart (lean, no checkout fill) ────────
  it('TC-E2E-001: Browse to cart journey with Percy snapshots', async function () {
    Logger.testStart('TC-E2E-001: Browse → Product → Cart');

    await home.open();
    const title = await home.getPageTitle();
    expect(title).to.include('Ecommerce');
    Logger.assert(`Homepage: "${title}"`);

    // Percy snapshot — homepage
    await home.h.percySnapshot('Homepage - Desktop');

    // Navigate to product
    await home.clickViewDetailsOnProduct(0);
    const productVisible = await product.isProductPageVisible();
    expect(productVisible).to.be.true;
    const productTitle = await product.getProductTitle();
    Logger.assert(`Product: "${productTitle}"`);

    // Percy snapshot — product detail
    await home.h.percySnapshot('Product Detail - Essential Cotton Tee');

    // Add to cart
    await product.selectSize('M');
    await product.clickAddToCart();
    Logger.assert('Item added to cart');

    // View cart
    await product.clickViewCart();
    const cartVisible = await cart.isCartPageVisible();
    expect(cartVisible).to.be.true;
    Logger.assert('Cart page visible');

    // Percy snapshot — cart
    await home.h.percySnapshot('Shopping Cart');

    Logger.pass('TC-E2E-001');
  });

  // ─── TC-E2E-002: Checkout page structure ──────────────────────────────────
  it('TC-E2E-002: Checkout page has all required sections', async function () {
    Logger.testStart('TC-E2E-002: Checkout sections');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.clickAddToCart();
    await product.clickViewCart();
    await cart.clickProceedToCheckout();

    const checkoutVisible = await checkout.isCheckoutPageVisible();
    expect(checkoutVisible).to.be.true;

    // Percy snapshot — checkout
    await home.h.percySnapshot('Checkout Page');

    const contact  = await checkout.isContactSectionVisible();
    const shipping = await checkout.isShippingSectionVisible();
    const payment  = await checkout.isPaymentSectionVisible();
    expect(contact).to.be.true;
    expect(shipping).to.be.true;
    expect(payment).to.be.true;
    Logger.assert('All checkout sections visible');

    Logger.pass('TC-E2E-002');
  });

  // ─── TC-E2E-003: Login error flow ─────────────────────────────────────────
  it('TC-E2E-003: Invalid login shows error dialog', async function () {
    Logger.testStart('TC-E2E-003: Login error flow');

    await home.open();
    await home.clickLogin();

    // Percy snapshot — login page
    await home.h.percySnapshot('Login Page');

    await login.login(testData.invalidUser.email, testData.invalidUser.password);
    const errorVisible = await login.isErrorDialogVisible();
    expect(errorVisible).to.be.true;
    Logger.assert('Error dialog shown');

    const errorTitle = await login.getErrorDialogTitle();
    expect(errorTitle).to.include('Login Error');
    await login.closeErrorDialog();

    Logger.pass('TC-E2E-003');
  });

  // ─── TC-E2E-004: Search ───────────────────────────────────────────────────
  it('TC-E2E-004: Search input accepts text', async function () {
    Logger.testStart('TC-E2E-004: Search');

    await home.open();
    await home.searchFor(testData.searchTerms.valid);
    const url = await home.h.getCurrentUrl();
    expect(url).to.include('ecommercebs.vercel.app');
    Logger.assert('Search executed without error');

    Logger.pass('TC-E2E-004');
  });

  // ─── TC-E2E-005: Nav categories ───────────────────────────────────────────
  it('TC-E2E-005: Navigation categories are clickable', async function () {
    Logger.testStart('TC-E2E-005: Nav clicks');

    await home.open();
    for (const cat of ['New', 'Men', 'Women']) {
      await home.clickNavCategory(cat);
      Logger.assert(`Clicked "${cat}"`);
    }

    Logger.pass('TC-E2E-005');
  });

  // ─── TC-E2E-006: Size selection ───────────────────────────────────────────
  it('TC-E2E-006: Size options are selectable', async function () {
    Logger.testStart('TC-E2E-006: Size selection');

    await home.open();
    await home.clickViewDetailsOnProduct(0);

    for (const size of ['XS', 'S', 'M', 'L', 'XL', 'XXL']) {
      await product.selectSize(size);
      Logger.assert(`Size "${size}" selected`);
    }

    Logger.pass('TC-E2E-006');
  });

  // ─── TC-E2E-007: Back navigation ──────────────────────────────────────────
  it('TC-E2E-007: Back navigation returns to homepage', async function () {
    Logger.testStart('TC-E2E-007: Back navigation');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.goBack();

    const logoVisible = await home.isLogoVisible();
    expect(logoVisible).to.be.true;
    Logger.assert('Back to homepage');

    Logger.pass('TC-E2E-007');
  });

  // ─── TC-E2E-008: Continue Shopping ────────────────────────────────────────
  it('TC-E2E-008: Continue Shopping returns from cart', async function () {
    Logger.testStart('TC-E2E-008: Continue Shopping');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.clickAddToCart();
    await product.clickViewCart();
    await cart.clickContinueShopping();

    const logoVisible = await home.isLogoVisible();
    expect(logoVisible).to.be.true;
    Logger.assert('Returned via Continue Shopping');

    Logger.pass('TC-E2E-008');
  });
});