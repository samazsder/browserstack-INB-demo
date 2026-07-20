'use strict';

const { By, until } = require('selenium-webdriver');
const TestHelpers = require('../utils/helpers');
const Logger = require('../utils/logger');

const BASE_URL = 'https://ecommercebs.vercel.app';

/**
 * HomePage — Page Object for FashionStack homepage.
 * Selectors grounded from DOM exploration session.
 */
class HomePage {
  constructor(driver) {
    this.driver = driver;
    this.h = new TestHelpers(driver);

    // Selectors (grounded from browsing history)
    this.selectors = {
      // Header — #login id observed in Step 5 attributes
      loginBtn:      '#login',
      // Search input — placeholder "Search..." observed in DOM snapshot Step 2
      searchInput:   'input[placeholder="Search..."]',
      // Dark mode toggle — role="switch" observed in DOM snapshot Step 2
      darkModeToggle:'button[role="switch"]',

      // Nav buttons — observed as button elements inside nav in DOM snapshot Step 2
      // Accessed via XPath text matching (text observed: New, Men, Women, Sale, Offers)
      navNew:        'New',
      navMen:        'Men',
      navWomen:      'Women',
      navSale:       'Sale',
      navOffers:     'Offers',

      // Products — h3 headings observed in DOM snapshot (Essential Cotton Tee, etc.)
      productName:   'h3',

      // Footer newsletter — placeholder observed in DOM snapshot Step 4
      newsletterEmail: 'input[placeholder="Enter your email address"]',
    };
  }

  async open() {
    Logger.step('Opening FashionStack homepage');
    await this.h.navigateTo(BASE_URL);
    await this.h.sleep(300);
  }

  async getPageTitle() {
    return this.h.getTitle();
  }

  async clickLogin() {
    Logger.step('Clicking Login button');
    await this.h.clickById('login');
    // Mobile browsers need more time to render the login page
    await this.h.sleep(2000);
  }

  async searchFor(term) {
    Logger.step(`Searching for: "${term}"`);
    const input = await this.h.findByCss('input[placeholder="Search..."]');
    await this.h.typeInto(input, term);
    await input.sendKeys(require('selenium-webdriver').Key.RETURN);
    await this.h.sleep(1000);
  }

  async scrollToFeaturedProducts() {
    Logger.step('Scrolling to Featured Products section');
    await this.h.scrollDown(800);
    await this.h.sleep(500);
    await this.h.scrollDown(800);
    await this.h.sleep(500);
  }

  async clickViewDetailsOnProduct(index = 0) {
    Logger.step(`Clicking View Details on product index ${index}`);
    await this.scrollToFeaturedProducts();
    // "View Details" button text observed in DOM snapshot Step 4 (main-830, main-854, etc.)
    const btns = await this.driver.findElements(
      By.xpath("//button[contains(text(),'View Details')]")
    );
    if (btns.length === 0) throw new Error('No View Details buttons found');
    await this.h.scrollToElement(btns[index]);
    await btns[index].click();
    await this.h.sleep(1000);
  }

  async getCartCount() {
    try {
      // Cart badge shows count "1" after add — observed in Step 17 DOM diff
      // The cart button is the second button in the header actions div
      const cartBadge = await this.driver.findElement(
        By.xpath("//header//button[contains(@class,'rounded-full') and string-length(normalize-space(text()))>0]")
      );
      return parseInt(await cartBadge.getText(), 10);
    } catch { return 0; }
  }

  async isLogoVisible() {
    return this.h.isPresent('h1');
  }

  async isNavVisible() {
    return this.h.isPresent('nav');
  }

  async isFeaturedProductsVisible() {
    try {
      await this.h.scrollToBottom();
      const heading = await this.h.findByText('Featured Products', 'h2');
      return heading.isDisplayed();
    } catch { return false; }
  }

  async subscribeNewsletter(email) {
    Logger.step(`Subscribing newsletter with: ${email}`);
    await this.h.scrollToBottom();
    const input = await this.h.findByCss('input[placeholder="Enter your email address"]');
    await this.h.typeInto(input, email);
    await this.h.clickByText('Subscribe', 'button');
    await this.h.sleep(500);
  }

  async toggleDarkMode() {
    Logger.step('Toggling dark mode');
    const toggle = await this.driver.findElement(By.css('button[role="switch"]'));
    await toggle.click();
    await this.h.sleep(300);
  }

  async clickNavCategory(category) {
    Logger.step(`Clicking nav category: ${category}`);
    const btn = await this.h.findByText(category, 'button');
    await btn.click();
    await this.h.sleep(500);
  }
}

module.exports = HomePage;