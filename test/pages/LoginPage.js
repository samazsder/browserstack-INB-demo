'use strict';

const { By, until } = require('selenium-webdriver');
const TestHelpers = require('../utils/helpers');
const Logger = require('../utils/logger');

/**
 * LoginPage — Page Object for FashionStack login page.
 * All selectors grounded from browsing history Steps 5-12.
 *
 * Observed selectors:
 *   - Email input:    id="email", placeholder="Enter your email"   (Step 6)
 *   - Password input: id="password", placeholder="Enter your password" (Step 7)
 *   - Sign In button: type="submit", text="Sign In"                (Step 9)
 *   - Error dialog:   role="alertdialog", heading "Login Error"    (Step 10)
 *   - Close dialog:   button text "Close"                          (Step 11)
 *   - Back to Home:   button text "Back to Home"                   (Step 12)
 *   - Sign up here:   button text "Sign up here"                   (DOM snapshot Step 5)
 *   - OTP button:     button text "Sign In with OTP"               (DOM snapshot Step 5)
 *   - Google button:  button text "Continue with Google"           (DOM snapshot Step 5)
 *   - Facebook button:button text "Continue with Facebook"         (DOM snapshot Step 5)
 */
class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.h = new TestHelpers(driver);
  }

  // ─── Selectors ─────────────────────────────────────────────────────────────

  // id="email" — observed Step 6
  get emailInput()    { return this.h.findById('email'); }
  // id="password" — observed Step 7
  get passwordInput() { return this.h.findById('password'); }
  // type="submit" Sign In button — observed Step 9
  get signInBtn()     { return this.h.findByCss('button[type="submit"]'); }
  // alertdialog — observed Step 10
  get errorDialog()   { return this.h.findByCss('[role="alertdialog"]'); }
  // Close button inside dialog — observed Step 11
  get closeDialogBtn(){ return this.h.findByText('Close', 'button'); }
  // Back to Home — observed Step 12
  get backToHomeBtn() { return this.h.findByText('Back to Home', 'button'); }
  // Sign up here — observed DOM snapshot Step 5
  get signUpBtn()     { return this.h.findByText('Sign up here', 'button'); }
  // OTP — observed DOM snapshot Step 5
  get otpBtn()        { return this.h.findByText('Sign In with OTP', 'button'); }
  // Google — observed DOM snapshot Step 5
  get googleBtn()     { return this.h.findByText('Continue with Google', 'button'); }
  // Facebook — observed DOM snapshot Step 5
  get facebookBtn()   { return this.h.findByText('Continue with Facebook', 'button'); }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async enterEmail(email) {
    Logger.step(`Entering email: ${email}`);
    const el = await this.emailInput;
    await this.h.typeInto(el, email);
  }

  async enterPassword(password) {
    Logger.step('Entering password');
    const el = await this.passwordInput;
    await this.h.typeInto(el, password);
  }

  async clickSignIn() {
    Logger.step('Clicking Sign In');
    const btn = await this.signInBtn;
    await this.h.click(btn);
    await this.h.sleep(2000);
  }

  async login(email, password) {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickSignIn();
  }

  async closeErrorDialog() {
    Logger.step('Closing error dialog');
    const btn = await this.closeDialogBtn;
    await this.h.click(btn);
    await this.h.sleep(300);
  }

  async goBackToHome() {
    Logger.step('Clicking Back to Home');
    const btn = await this.backToHomeBtn;
    await this.h.click(btn);
    await this.h.sleep(500);
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async isLoginPageVisible() {
    try {
      // "Welcome Back" heading observed in DOM snapshot Step 5
      const heading = await this.h.findByText('Welcome Back', 'h2');
      return heading.isDisplayed();
    } catch { return false; }
  }

  async isErrorDialogVisible() {
    try {
      const dialog = await this.driver.findElement(By.css('[role="alertdialog"]'));
      return dialog.isDisplayed();
    } catch { return false; }
  }

  async getErrorDialogTitle() {
    try {
      // "Login Error" heading observed in Step 10 DOM snapshot
      const heading = await this.h.findByText('Login Error', 'h2');
      return heading.getText();
    } catch { return ''; }
  }

  async isSignInButtonVisible() {
    try {
      const btn = await this.signInBtn;
      return btn.isDisplayed();
    } catch { return false; }
  }

  async getSignInButtonText() {
    try {
      const btn = await this.signInBtn;
      return btn.getText();
    } catch { return ''; }
  }

  async isSocialLoginVisible() {
    try {
      const google = await this.googleBtn;
      return google.isDisplayed();
    } catch { return false; }
  }
}

module.exports = LoginPage;