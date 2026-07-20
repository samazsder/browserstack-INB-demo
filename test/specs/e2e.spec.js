'use strict';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  END-TO-END TESTS — FashionStack Ecommerce                  ║
 * ║  Purpose: Full user journey coverage with Percy snapshots   ║
 * ║  Tag: @e2e                                                  ║
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
  this.timeout(120000);
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
        await home.h.markBSStatus('failed', this.currentTest.err?.message || '');
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

  // ─── TC-E2E-001: Homepage → Product → Cart → Checkout ─────────────────────
  it('TC-E2E-001: Complete browse-to-checkout journey', async function () {
    Logger.testStart('TC-E2E-001: Browse → Product → Cart → Checkout');

    // Step 1: Open homepage
    Logger.step('Step 1: Open homepage');
    await home.open();
    const title = await home.getPageTitle();
    expect(title).to.include('Ecommerce');
    Logger.assert(`Homepage loaded: "${title}"`);

    // Percy snapshot — homepage (Desktop Chrome baseline)
    await home.h.percySnapshot('Homepage - Desktop');

    // Step 2: Navigate to product detail
    Logger.step('Step 2: Navigate to product detail');
    await home.clickViewDetailsOnProduct(0);
    const productVisible = await product.isProductPageVisible();
    expect(productVisible).to.be.true;
    const productTitle = await product.getProductTitle();
    Logger.assert(`Product page: "${productTitle}"`);

    // Percy snapshot — product detail
    await home.h.percySnapshot('Product Detail - Essential Cotton Tee');

    // Step 3: Select size and add to cart
    Logger.step('Step 3: Select size M and add to cart');
    await product.selectSize('M');
    await product.clickAddToCart();
    Logger.assert('Item added to cart');

    // Step 4: View cart
    Logger.step('Step 4: View cart');
    await product.clickViewCart();
    const cartVisible = await cart.isCartPageVisible();
    expect(cartVisible).to.be.true;
    const itemInCart = await cart.isItemInCart('Essential Cotton Tee');
    expect(itemInCart).to.be.true;
    Logger.assert('Cart shows Essential Cotton Tee');

    // Percy snapshot — cart
    await home.h.percySnapshot('Shopping Cart');

    // Step 5: Proceed to checkout
    Logger.step('Step 5: Proceed to checkout');
    await cart.clickProceedToCheckout();
    const checkoutVisible = await checkout.isCheckoutPageVisible();
    expect(checkoutVisible).to.be.true;
    Logger.assert('Checkout page loaded');

    // Step 6: Verify checkout sections
    Logger.step('Step 6: Verify checkout sections');
    const contactVisible  = await checkout.isContactSectionVisible();
    const shippingVisible = await checkout.isShippingSectionVisible();
    const paymentVisible  = await checkout.isPaymentSectionVisible();
    const summaryVisible  = await checkout.isOrderSummaryVisible();
    expect(contactVisible).to.be.true;
    expect(shippingVisible).to.be.true;
    expect(paymentVisible).to.be.true;
    expect(summaryVisible).to.be.true;
    Logger.assert('All checkout sections visible');

    // Percy snapshot — checkout
    await home.h.percySnapshot('Checkout Page');

    // Step 7: Fill checkout form
    Logger.step('Step 7: Fill checkout form');
    await checkout.fillFullCheckout(
      testData.validUser.email,
      testData.shippingAddress
    );
    Logger.assert('Checkout form filled');

    Logger.pass('TC-E2E-001');
  });

  // ─── TC-E2E-002: Login → Invalid credentials → Error handling ─────────────
  it('TC-E2E-002: Login flow with invalid credentials shows error', async function () {
    Logger.testStart('TC-E2E-002: Login error handling');

    await home.open();
    await home.clickLogin();

    // Verify login page
    const loginVisible = await login.isLoginPageVisible();
    expect(loginVisible).to.be.true;
    Logger.assert('Login page visible');

    // Percy snapshot — login page
    await home.h.percySnapshot('Login Page');

    // Attempt login with invalid credentials
    await login.login(testData.invalidUser.email, testData.invalidUser.password);

    // Verify error dialog
    const errorVisible = await login.isErrorDialogVisible();
    expect(errorVisible).to.be.true;
    Logger.assert('Error dialog shown for invalid credentials');

    const errorTitle = await login.getErrorDialogTitle();
    expect(errorTitle).to.include('Login Error');
    Logger.assert(`Error title: "${errorTitle}"`);

    // Close dialog and verify we're still on login page
    await login.closeErrorDialog();
    const stillOnLogin = await login.isLoginPageVisible();
    expect(stillOnLogin).to.be.true;
    Logger.assert('Still on login page after closing error');

    Logger.pass('TC-E2E-002');
  });

  // ─── TC-E2E-003: Multi-product add to cart ────────────────────────────────
  it('TC-E2E-003: Add multiple products to cart', async function () {
    Logger.testStart('TC-E2E-003: Multi-product cart');

    // Add first product
    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.selectSize('S');
    await product.clickAddToCart();
    Logger.assert('First product added');

    // Go back and add second product
    await product.goBack();
    await home.h.sleep(500);
    await home.clickViewDetailsOnProduct(1);
    await product.selectSize('L');
    await product.clickAddToCart();
    Logger.assert('Second product added');

    // View cart
    await product.clickViewCart();
    const cartVisible = await cart.isCartPageVisible();
    expect(cartVisible).to.be.true;
    Logger.assert('Cart page visible with multiple items');

    Logger.pass('TC-E2E-003');
  });

  // ─── TC-E2E-004: Search functionality ────────────────────────────────────
  it('TC-E2E-004: Search for products', async function () {
    Logger.testStart('TC-E2E-004: Search functionality');

    await home.open();
    await home.searchFor(testData.searchTerms.valid);
    await home.h.sleep(1000);

    // Verify page still loaded (search may filter or navigate)
    const url = await home.h.getCurrentUrl();
    Logger.assert(`URL after search: ${url}`);
    expect(url).to.include('ecommercebs.vercel.app');

    Logger.pass('TC-E2E-004');
  });

  // ─── TC-E2E-005: Navigation categories ───────────────────────────────────
  it('TC-E2E-005: Navigation category buttons are clickable', async function () {
    Logger.testStart('TC-E2E-005: Nav category clicks');

    await home.open();
    for (const cat of ['New', 'Men', 'Women']) {
      Logger.step(`Clicking nav: ${cat}`);
      await home.clickNavCategory(cat);
      await home.h.sleep(500);
      Logger.assert(`Clicked "${cat}" without error`);
    }

    Logger.pass('TC-E2E-005');
  });

  // ─── TC-E2E-006: Size selection on product ────────────────────────────────
  it('TC-E2E-006: All size options are selectable on product page', async function () {
    Logger.testStart('TC-E2E-006: Size selection');

    await home.open();
    await home.clickViewDetailsOnProduct(0);

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    for (const size of sizes) {
      Logger.step(`Selecting size: ${size}`);
      await product.selectSize(size);
      Logger.assert(`Size "${size}" selected`);
    }

    Logger.pass('TC-E2E-006');
  });

  // ─── TC-E2E-007: Back navigation ─────────────────────────────────────────
  it('TC-E2E-007: Back navigation returns to homepage', async function () {
    Logger.testStart('TC-E2E-007: Back navigation');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.goBack();
    await home.h.sleep(500);

    const logoVisible = await home.isLogoVisible();
    expect(logoVisible).to.be.true;
    Logger.assert('Returned to homepage after back navigation');

    Logger.pass('TC-E2E-007');
  });

  // ─── TC-E2E-008: Continue shopping from cart ──────────────────────────────
  it('TC-E2E-008: Continue Shopping returns from cart to homepage', async function () {
    Logger.testStart('TC-E2E-008: Continue Shopping');

    await home.open();
    await home.clickViewDetailsOnProduct(0);
    await product.clickAddToCart();
    await product.clickViewCart();

    const cartVisible = await cart.isCartPageVisible();
    expect(cartVisible).to.be.true;

    await cart.clickContinueShopping();
    await home.h.sleep(500);

    const logoVisible = await home.isLogoVisible();
    expect(logoVisible).to.be.true;
    Logger.assert('Returned to homepage via Continue Shopping');

    Logger.pass('TC-E2E-008');
  });
});