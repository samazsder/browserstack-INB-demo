'use strict';

const { By, until, Key } = require('selenium-webdriver');
const Logger = require('./logger');

/**
 * TestHelpers — reusable Selenium utility methods with built-in logging,
 * smart waits, retry logic, and BrowserStack status marking.
 */
class TestHelpers {
  constructor(driver) {
    this.driver = driver;
    this.defaultTimeout = 15000;
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigateTo(url) {
    Logger.step(`Navigating to: ${url}`);
    await this.driver.get(url);
    await this.driver.sleep(500);
  }

  async getTitle() {
    return this.driver.getTitle();
  }

  async getCurrentUrl() {
    return this.driver.getCurrentUrl();
  }

  // ─── Element Finders ───────────────────────────────────────────────────────

  async findById(id, timeout = this.defaultTimeout) {
    Logger.debug(`Finding element by id: #${id}`);
    return this.driver.wait(until.elementLocated(By.id(id)), timeout);
  }

  async findByCss(selector, timeout = this.defaultTimeout) {
    Logger.debug(`Finding element by CSS: ${selector}`);
    return this.driver.wait(until.elementLocated(By.css(selector)), timeout);
  }

  async findByXpath(xpath, timeout = this.defaultTimeout) {
    Logger.debug(`Finding element by XPath: ${xpath}`);
    return this.driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  }

  async findAllByCss(selector, timeout = this.defaultTimeout) {
    await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    return this.driver.findElements(By.css(selector));
  }

  async findByText(text, tag = '*') {
    return this.driver.wait(
      until.elementLocated(By.xpath(`//${tag}[normalize-space(text())='${text}']`)),
      this.defaultTimeout
    );
  }

  async findByPartialText(text, tag = '*') {
    return this.driver.wait(
      until.elementLocated(By.xpath(`//${tag}[contains(normalize-space(text()),'${text}')]`)),
      this.defaultTimeout
    );
  }

  // ─── Interactions ──────────────────────────────────────────────────────────

  async click(element) {
    await this.driver.wait(until.elementIsVisible(element), this.defaultTimeout);
    await this.driver.wait(until.elementIsEnabled(element), this.defaultTimeout);
    await element.click();
  }

  async clickById(id) {
    Logger.step(`Clicking element: #${id}`);
    const el = await this.findById(id);
    await this.click(el);
  }

  async clickByCss(selector) {
    Logger.step(`Clicking: ${selector}`);
    const el = await this.findByCss(selector);
    await this.click(el);
  }

  async clickByText(text, tag = 'button') {
    Logger.step(`Clicking button with text: "${text}"`);
    const el = await this.findByText(text, tag);
    await this.click(el);
  }

  async typeInto(element, text, clear = true) {
    await this.driver.wait(until.elementIsVisible(element), this.defaultTimeout);
    if (clear) await element.clear();
    await element.sendKeys(text);
  }

  async typeById(id, text) {
    Logger.step(`Typing "${text}" into #${id}`);
    const el = await this.findById(id);
    await this.typeInto(el, text);
  }

  async typeByCss(selector, text) {
    Logger.step(`Typing "${text}" into ${selector}`);
    const el = await this.findByCss(selector);
    await this.typeInto(el, text);
  }

  async clearAndType(selector, text) {
    const el = await this.findByCss(selector);
    await el.clear();
    await el.sendKeys(text);
  }

  async pressEnter(element) {
    await element.sendKeys(Key.RETURN);
  }

  async scrollToElement(element) {
    await this.driver.executeScript('arguments[0].scrollIntoView({behavior:"smooth",block:"center"})', element);
    await this.driver.sleep(300);
  }

  async scrollDown(pixels = 500) {
    await this.driver.executeScript(`window.scrollBy(0, ${pixels})`);
    await this.driver.sleep(300);
  }

  async scrollToBottom() {
    await this.driver.executeScript('window.scrollTo(0, document.body.scrollHeight)');
    await this.driver.sleep(500);
  }

  // ─── Waits ─────────────────────────────────────────────────────────────────

  async waitForVisible(selector, timeout = this.defaultTimeout) {
    const el = await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async waitForText(selector, text, timeout = this.defaultTimeout) {
    Logger.step(`Waiting for text "${text}" in ${selector}`);
    await this.driver.wait(async () => {
      try {
        const el = await this.driver.findElement(By.css(selector));
        const t = await el.getText();
        return t.includes(text);
      } catch { return false; }
    }, timeout, `Timeout waiting for text "${text}" in ${selector}`);
  }

  async waitForUrlContains(fragment, timeout = this.defaultTimeout) {
    Logger.step(`Waiting for URL to contain: ${fragment}`);
    await this.driver.wait(until.urlContains(fragment), timeout);
  }

  async waitForElementGone(selector, timeout = this.defaultTimeout) {
    await this.driver.wait(async () => {
      const els = await this.driver.findElements(By.css(selector));
      return els.length === 0;
    }, timeout);
  }

  async sleep(ms) {
    return this.driver.sleep(ms);
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async isVisible(selector) {
    try {
      const el = await this.driver.findElement(By.css(selector));
      return el.isDisplayed();
    } catch { return false; }
  }

  async isPresent(selector) {
    const els = await this.driver.findElements(By.css(selector));
    return els.length > 0;
  }

  async getText(selector) {
    const el = await this.findByCss(selector);
    return el.getText();
  }

  async getTextById(id) {
    const el = await this.findById(id);
    return el.getText();
  }

  async getAttribute(selector, attr) {
    const el = await this.findByCss(selector);
    return el.getAttribute(attr);
  }

  // ─── Retry Logic ───────────────────────────────────────────────────────────

  /**
   * Retry an async action up to `maxAttempts` times.
   * Useful for flaky network-dependent assertions.
   */
  async retry(fn, maxAttempts = 3, delayMs = 1000) {
    let lastError;
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        return await fn();
      } catch (e) {
        lastError = e;
        Logger.warn(`Retry ${i}/${maxAttempts} failed: ${e.message}`);
        if (i < maxAttempts) await this.driver.sleep(delayMs);
      }
    }
    throw lastError;
  }

  // ─── BrowserStack Utilities ────────────────────────────────────────────────

  /**
   * Mark the BrowserStack session as passed or failed.
   * @param {'passed'|'failed'} status
   * @param {string} reason
   */
  async markBSStatus(status, reason = '') {
    try {
      await this.driver.executeScript(
        `browserstack_executor: ${JSON.stringify({ action: 'setSessionStatus', arguments: { status, reason } })}`
      );
      Logger.info(`BrowserStack session marked: ${status}${reason ? ' — ' + reason : ''}`);
    } catch (e) {
      Logger.warn(`Could not mark BS status: ${e.message}`);
    }
  }

  /**
   * Add a custom annotation to the BrowserStack session.
   */
  async annotate(message) {
    try {
      await this.driver.executeScript(
        `browserstack_executor: ${JSON.stringify({ action: 'annotate', arguments: { data: message, level: 'info' } })}`
      );
    } catch { /* ignore */ }
  }

  /**
   * Take a Percy visual screenshot (BrowserStack Automate requires percyScreenshot).
   * Checks isPercyEnabled() first to avoid 401/502 errors on non-Percy sessions.
   * @param {string} name - Snapshot name
   */
  async percySnapshot(name) {
    try {
      const percyLib = require('@percy/selenium-webdriver');
      // Only attempt if Percy is enabled for this session
      const enabled = await percyLib.isPercyEnabled();
      if (!enabled) {
        Logger.debug(`Percy not enabled for this session — skipping "${name}"`);
        return;
      }
      await percyLib.percyScreenshot(this.driver, name);
      Logger.percy(name);
    } catch (e) {
      // Percy errors are non-fatal — log and continue
      Logger.warn(`Percy snapshot skipped (${name}): ${e.message?.substring(0, 100)}`);
    }
  }

  // ─── JavaScript Execution ──────────────────────────────────────────────────

  async executeScript(script, ...args) {
    return this.driver.executeScript(script, ...args);
  }

  async highlightElement(element) {
    await this.driver.executeScript(
      "arguments[0].style.border='3px solid red'", element
    );
  }

  // ─── Screenshot ────────────────────────────────────────────────────────────

  async takeScreenshot(name = 'screenshot') {
    try {
      const data = await this.driver.takeScreenshot();
      const fs = require('fs');
      const path = require('path');
      const dir = path.join(__dirname, '../../reports/screenshots');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `${name}-${Date.now()}.png`);
      fs.writeFileSync(file, data, 'base64');
      Logger.info(`Screenshot saved: ${file}`);
      return file;
    } catch (e) {
      Logger.warn(`Screenshot failed: ${e.message}`);
    }
  }
}

module.exports = TestHelpers;