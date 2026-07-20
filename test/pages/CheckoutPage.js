'use strict';

const { By } = require('selenium-webdriver');
const TestHelpers = require('../utils/helpers');
const Logger = require('../utils/logger');

/**
 * CheckoutPage — Page Object for FashionStack checkout page.
 * All selectors grounded from browsing history Step 20 DOM snapshot.
 *
 * Observed selectors:
 *   - "Checkout" h1                                                (Step 20 DOM)
 *   - "1 Contact Information" h4                                   (Step 20 DOM)
 *   - "2 Shipping Address" h4                                      (Step 20 DOM)
 *   - "3 Payment Information" h4                                   (Step 20 DOM)
 *   - Email input: placeholder="Email address"                     (Step 20 DOM)
 *   - First name: placeholder="First name"                         (Step 20 DOM)
 *   - Last name: placeholder="Last name"                           (Step 20 DOM)
 *   - Address: placeholder="Address"                               (Step 20 DOM)
 *   - City: placeholder="City"                                     (Step 20 DOM)
 *   - ZIP: placeholder="ZIP code"                                  (Step 20 DOM)
 *   - Phone: placeholder="Phone"                                   (Step 20 DOM)
 *   - "Complete Order" button                                      (Step 20 DOM)
 *   - "Order Summary" h4                                           (Step 20 DOM)
 */
class CheckoutPage {
  constructor(driver) {
    this.driver = driver;
    this.h = new TestHelpers(driver);
  }

  // ─── Selectors ─────────────────────────────────────────────────────────────

  // "Checkout" h1 — observed Step 20 DOM
  get checkoutHeading()   { return this.h.findByText('Checkout', 'h1'); }
  // Contact email — placeholder="Email address" observed Step 20 DOM
  get contactEmail()      { return this.h.findByCss('input[placeholder="Email address"]'); }
  // First name — placeholder="First name" observed Step 20 DOM
  get firstNameInput()    { return this.h.findByCss('input[placeholder="First name"]'); }
  // Last name — placeholder="Last name" observed Step 20 DOM
  get lastNameInput()     { return this.h.findByCss('input[placeholder="Last name"]'); }
  // Address — placeholder="Address" observed Step 20 DOM
  get addressInput()      { return this.h.findByCss('input[placeholder="Address"]'); }
  // Apartment — placeholder="Apartment, suite, etc. (optional)" observed Step 20 DOM
  get apartmentInput()    { return this.h.findByCss('input[placeholder="Apartment, suite, etc. (optional)"]'); }
  // City — placeholder="City" observed Step 20 DOM
  get cityInput()         { return this.h.findByCss('input[placeholder="City"]'); }
  // ZIP — placeholder="ZIP code" observed Step 20 DOM
  get zipInput()          { return this.h.findByCss('input[placeholder="ZIP code"]'); }
  // Phone — placeholder="Phone" observed Step 20 DOM
  get phoneInput()        { return this.h.findByCss('input[placeholder="Phone"]'); }
  // Complete Order button — text observed Step 20 DOM
  get completeOrderBtn()  { return this.h.findByText('Complete Order', 'button'); }
  // Order Summary h4 — observed Step 20 DOM
  get orderSummaryH4()    { return this.h.findByText('Order Summary', 'h4'); }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async fillContactInfo(email) {
    Logger.step(`Filling contact email: ${email}`);
    const el = await this.contactEmail;
    await this.h.typeInto(el, email);
  }

  async fillShippingAddress(data) {
    Logger.step('Filling shipping address');
    const { firstName, lastName, address, city, zip, phone } = data;

    const fn = await this.firstNameInput;
    await this.h.typeInto(fn, firstName);

    const ln = await this.lastNameInput;
    await this.h.typeInto(ln, lastName);

    const addr = await this.addressInput;
    await this.h.typeInto(addr, address);

    const c = await this.cityInput;
    await this.h.typeInto(c, city);

    const z = await this.zipInput;
    await this.h.typeInto(z, zip);

    const p = await this.phoneInput;
    await this.h.typeInto(p, phone);
  }

  async clickCompleteOrder() {
    Logger.step('Clicking Complete Order');
    const btn = await this.completeOrderBtn;
    await this.h.scrollToElement(btn);
    await this.h.click(btn);
    await this.h.sleep(2000);
  }

  async fillFullCheckout(contactEmail, shippingData) {
    await this.fillContactInfo(contactEmail);
    await this.fillShippingAddress(shippingData);
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async isCheckoutPageVisible() {
    try {
      const heading = await this.checkoutHeading;
      return heading.isDisplayed();
    } catch { return false; }
  }

  async isContactSectionVisible() {
    try {
      const el = await this.h.findByPartialText('Contact Information', 'h4');
      return el.isDisplayed();
    } catch { return false; }
  }

  async isShippingSectionVisible() {
    try {
      const el = await this.h.findByPartialText('Shipping Address', 'h4');
      return el.isDisplayed();
    } catch { return false; }
  }

  async isPaymentSectionVisible() {
    try {
      const el = await this.h.findByPartialText('Payment Information', 'h4');
      return el.isDisplayed();
    } catch { return false; }
  }

  async isOrderSummaryVisible() {
    try {
      const el = await this.orderSummaryH4;
      return el.isDisplayed();
    } catch { return false; }
  }

  async isCompleteOrderVisible() {
    try {
      const btn = await this.completeOrderBtn;
      return btn.isDisplayed();
    } catch { return false; }
  }
}

module.exports = CheckoutPage;