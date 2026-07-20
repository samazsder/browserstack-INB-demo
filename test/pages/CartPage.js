'use strict';

const { By } = require('selenium-webdriver');
const TestHelpers = require('../utils/helpers');
const Logger = require('../utils/logger');

/**
 * CartPage — Page Object for FashionStack shopping cart page.
 * All selectors grounded from browsing history Steps 18-19.
 *
 * Observed selectors:
 *   - "Shopping Cart" h1                                           (Step 18 DOM)
 *   - "Essential Cotton Tee" h3 in cart                           (Step 18 DOM)
 *   - "Order Summary" h3                                          (Step 18 DOM)
 *   - "Proceed to Checkout" button                                (Step 18 DOM)
 *   - "Continue Shopping" button                                  (Step 18 DOM)
 */
class CartPage {
  constructor(driver) {
    this.driver = driver;
    this.h = new TestHelpers(driver);
  }

  // ─── Selectors ─────────────────────────────────────────────────────────────

  // "Shopping Cart" h1 — observed Step 18 DOM snapshot
  get cartHeading()         { return this.h.findByText('Shopping Cart', 'h1'); }
  // "Order Summary" h3 — observed Step 18 DOM snapshot
  get orderSummaryHeading() { return this.h.findByText('Order Summary', 'h3'); }
  // "Proceed to Checkout" button — observed Step 18 DOM snapshot
  get proceedToCheckoutBtn(){ return this.h.findByText('Proceed to Checkout', 'button'); }
  // "Continue Shopping" button — observed Step 18 DOM snapshot
  get continueShoppingBtn() { return this.h.findByText('Continue Shopping', 'button'); }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async clickProceedToCheckout() {
    Logger.step('Clicking Proceed to Checkout');
    const btn = await this.proceedToCheckoutBtn;
    await this.h.click(btn);
    await this.h.sleep(1000);
  }

  async clickContinueShopping() {
    Logger.step('Clicking Continue Shopping');
    const btn = await this.continueShoppingBtn;
    await this.h.click(btn);
    await this.h.sleep(500);
  }

  async removeItem() {
    Logger.step('Removing item from cart');
    // Cart page has buttons for quantity and remove — use all buttons on page
    // and pick the one that is NOT "Proceed to Checkout" or "Continue Shopping"
    // The cart item row buttons (main-1368, main-1370, main-1362) were observed in Step 18 DOM
    // We use a safe approach: find all buttons, filter by position
    const allBtns = await this.driver.findElements(By.css('button'));
    for (const btn of allBtns) {
      try {
        const txt = await btn.getText();
        // Remove button typically has no text or an X/trash icon
        if (txt === '' || txt === '×' || txt.toLowerCase().includes('remove')) {
          await this.h.click(btn);
          await this.h.sleep(500);
          return;
        }
      } catch { /* skip stale */ }
    }
  }

  async increaseItemQuantity() {
    Logger.step('Increasing item quantity in cart');
    // Quantity section observed in Step 18 DOM — buttons main-1368 (minus) and main-1370 (plus)
    // Use all buttons and find the + one (typically contains '+' or is after the count display)
    const allBtns = await this.driver.findElements(By.css('button'));
    for (const btn of allBtns) {
      try {
        const txt = await btn.getText();
        if (txt === '+') {
          await this.h.click(btn);
          await this.h.sleep(500);
          return;
        }
      } catch { /* skip stale */ }
    }
  }
  async removeItem() {
    Logger.step('Removing item from cart');
    // Cart page has buttons for quantity and remove — use all buttons on page
    // and pick the one that is NOT "Proceed to Checkout" or "Continue Shopping"
    // The cart item row buttons (main-1368, main-1370, main-1362) were observed in Step 18 DOM
    // We use a safe approach: find all buttons, filter by position
    const allBtns = await this.driver.findElements(By.css('button'));
    for (const btn of allBtns) {
      try {
        const txt = await btn.getText();
        // Remove button typically has no text or an X/trash icon
        if (txt === '' || txt === '×' || txt.toLowerCase().includes('remove')) {
          await this.h.click(btn);
          await this.h.sleep(500);
          return;
        }
      } catch { /* skip stale */ }
    }
  }

  async increaseItemQuantity() {
    Logger.step('Increasing item quantity in cart');
    // Quantity section observed in Step 18 DOM — buttons main-1368 (minus) and main-1370 (plus)
    // Use all buttons and find the + one (typically contains '+' or is after the count display)
    const allBtns = await this.driver.findElements(By.css('button'));
    for (const btn of allBtns) {
      try {
        const txt = await btn.getText();
        if (txt === '+') {
          await this.h.click(btn);
          await this.h.sleep(500);
          return;
        }
      } catch { /* skip stale */ }
    }
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async isCartPageVisible() {
    try {
      const heading = await this.cartHeading;
      return heading.isDisplayed();
    } catch { return false; }
  }

  async isItemInCart(productName) {
    try {
      const item = await this.h.findByPartialText(productName, 'h3');
      return item.isDisplayed();
    } catch { return false; }
  }

  async isOrderSummaryVisible() {
    try {
      const el = await this.orderSummaryHeading;
      return el.isDisplayed();
    } catch { return false; }
  }

  async isProceedToCheckoutVisible() {
    try {
      const btn = await this.proceedToCheckoutBtn;
      return btn.isDisplayed();
    } catch { return false; }
  }

  async getCartItemCount() {
    try {
      // "Shopping Cart" h1 observed Step 18 DOM; item names are h3 elements on the page
      // Count h3 elements that are product names (not "Order Summary")
      const items = await this.driver.findElements(By.css('h3'));
      let count = 0;
      for (const el of items) {
        const txt = await el.getText();
        if (txt && txt !== 'Order Summary') count++;
      }
      return count;
    } catch { return 0; }
  }
}

module.exports = CartPage;