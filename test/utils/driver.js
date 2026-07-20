'use strict';

const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const firefox = require('selenium-webdriver/firefox');

/**
 * DriverFactory — creates a local or BrowserStack WebDriver instance.
 * When running via `browserstack-node-sdk`, the SDK patches Builder
 * automatically; this factory just ensures consistent options.
 */
class DriverFactory {
  /**
   * Build a WebDriver instance.
   * @param {string} browser - 'chrome' | 'firefox' | 'safari' (default: chrome)
   * @returns {Promise<WebDriver>}
   */
  static async build(browser = 'chrome') {
    const isCI = process.env.BROWSERSTACK_BUILD_NAME !== undefined;

    if (isCI) {
      // BrowserStack SDK patches Builder — just build with the target browser
      console.log(`\n🌐 [BrowserStack] Building driver for: ${browser}`);
      const driver = await new Builder().forBrowser(browser).build();
      return driver;
    }

    // Local execution
    console.log(`\n💻 [Local] Building driver for: ${browser}`);
    let builder = new Builder();

    if (browser === 'chrome') {
      const opts = new chrome.Options();
      opts.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080');
      builder = builder.forBrowser('chrome').setChromeOptions(opts);
    } else if (browser === 'firefox') {
      const opts = new firefox.Options();
      opts.addArguments('--width=1920', '--height=1080');
      builder = builder.forBrowser('firefox').setFirefoxOptions(opts);
    } else {
      builder = builder.forBrowser(browser);
    }

    return builder.build();
  }

  /**
   * Quit driver safely.
   * @param {WebDriver} driver
   */
  static async quit(driver) {
    if (driver) {
      try {
        await driver.quit();
        console.log('✅ Driver session closed.');
      } catch (e) {
        console.warn('⚠️  Driver quit error (ignored):', e.message);
      }
    }
  }
}

module.exports = DriverFactory;