'use strict';

const { By } = require('selenium-webdriver');
const TestHelpers = require('../utils/helpers');
const Logger = require('../utils/logger');

/**
 * ProductPage — Page Object for FashionStack product detail page.
 * All selectors grounded from browsing history Steps 14-17.
 *
 * Observed selectors:
 *   - Product heading: h1 "Essential Cotton Tee"                   (Step 14 DOM)
 *   - Color buttons:   button elements in color section            (Step 14 DOM)
 *   - Size buttons:    button text "XS","S","M","L","XL","XXL"     (Step 14 DOM)
 *   - Add to Cart btn: text "Add to Cart - $39.99"                 (Step 15 DOM diff)
 *   - View Cart btn:   text "View Cart"                            (Step 15 DOM diff)
 *   - Back to Products:button text "Back to Products"              (Step 14 DOM)
 *   - Product Details: h3 "Product Details"                        (Step 15 DOM diff)
 */
class ProductPage {
  constructor(driver) {
    this.driver = driver;
    this.h = new TestHelpers(driver);
  }

  // ─── Selectors ─────────────────────────────────────────────────────────────

  // h1 product name — observed Step 14 DOM snapshot ("Essential Cotton Tee")
  // Page has TWO h1s: "FashionStack" logo in header + product name in main
  // Use XPath to get the h1 inside main element specifically
  get productTitle()    { return this.h.findByXpath('//main//h1'); }
  // Back to Products — observed Step 14 DOM snapshot
  get backBtn()         { return this.h.findByText('Back to Products', 'button'); }
  // Size buttons — text observed Step 14 DOM snapshot
  get sizeXS()          { return this.h.findByText('XS', 'button'); }
  get sizeS()           { return this.h.findByText('S', 'button'); }
  get sizeM()           { return this.h.findByText('M', 'button'); }
  get sizeL()           { return this.h.findByText('L', 'button'); }
  get sizeXL()          { return this.h.findByText('XL', 'button'); }
  get sizeXXL()         { return this.h.findByText('XXL', 'button'); }
  // Add to Cart — text "Add to Cart" observed Step 15 DOM diff
  get addToCartBtn()    { return this.h.findByPartialText('Add to Cart', 'button'); }
  // View Cart — text observed Step 15 DOM diff
  get viewCartBtn()     { return this.h.findByText('View Cart', 'button'); }
  // Product Details heading — observed Step 15 DOM diff
  get productDetailsH3(){ return this.h.findByText('Product Details', 'h3'); }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async getProductTitle() {
    const el = await this.productTitle;
    return el.getText();
  }

  async selectSize(size) {
    Logger.step(`Selecting size: ${size}`);
    const btn = await this.h.findByText(size, 'button');
    await this.h.click(btn);
  }

  async selectColorByIndex(index = 0) {
    Logger.step(`Selecting color at index: ${index}`);
    // "Color: White" h3 observed in Step 14 DOM snapshot; color buttons follow it
    const colorBtns = await this.driver.findElements(
      By.xpath("//h3[starts-with(normalize-space(text()),'Color')]/following-sibling::div[1]//button")
    );
    if (colorBtns[index]) {
      await this.h.click(colorBtns[index]);
      await this.h.sleep(300);
    }
  }

  async increaseQuantity() {
    Logger.step('Increasing quantity');
    // "Quantity" h3 observed in Step 14 DOM snapshot; +/- buttons follow it
    const qtyBtns = await this.driver.findElements(
      By.xpath("//h3[normalize-space(text())='Quantity']/following-sibling::div[1]//button")
    );
    if (qtyBtns.length >= 2) {
      await this.h.click(qtyBtns[1]);
      await this.h.sleep(300);
    }
  }

  async decreaseQuantity() {
    Logger.step('Decreasing quantity');
    const qtyBtns = await this.driver.findElements(
      By.xpath("//h3[normalize-space(text())='Quantity']/following-sibling::div[1]//button")
    );
    if (qtyBtns.length >= 1) {
      await this.h.click(qtyBtns[0]);
      await this.h.sleep(300);
    }
  }

  async clickAddToCart() {
    Logger.step('Clicking Add to Cart');
    await this.h.scrollDown(400);
    const btn = await this.addToCartBtn;
    // Use JS click to avoid ElementClickInterceptedError from sticky header overlay
    await this.driver.executeScript('arguments[0].scrollIntoView({block:"center"})', btn);
    await this.h.sleep(200);
    await this.driver.executeScript('arguments[0].click()', btn);
    await this.h.sleep(1000);
  }

  async clickViewCart() {
    Logger.step('Clicking View Cart');
    const btn = await this.viewCartBtn;
    await this.h.click(btn);
    await this.h.sleep(1000);
  }

  async goBack() {
    Logger.step('Going back to products');
    const btn = await this.backBtn;
    await this.h.click(btn);
    await this.h.sleep(500);
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async isProductPageVisible() {
    try {
      const title = await this.productTitle;
      return title.isDisplayed();
    } catch { return false; }
  }

  async isAddToCartVisible() {
    try {
      await this.h.scrollDown(400);
      const btn = await this.addToCartBtn;
      return btn.isDisplayed();
    } catch { return false; }
  }

  async getAddToCartButtonText() {
    try {
      await this.h.scrollDown(400);
      const btn = await this.addToCartBtn;
      return btn.getText();
    } catch { return ''; }
  }

  async isSizeSelectionVisible() {
    try {
      const xs = await this.sizeXS;
      return xs.isDisplayed();
    } catch { return false; }
  }
}

module.exports = ProductPage;