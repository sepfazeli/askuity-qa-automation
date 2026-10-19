import type { User } from '../data/users';
import { log } from '../utils/logger';
import { PAGE_ROOT, testId, testIdPrefix } from '../utils/selectors';
import { BasePage } from './base.page';
import InventoryPage from './inventory.page';

class LoginPage extends BasePage {
  protected readonly root = PAGE_ROOT.login;

  get title() {
    return $(testId('login-title'));
  }

  get usernameInput() {
    return $(testId('username'));
  }

  get passwordInput() {
    return $(testId('password'));
  }

  get passwordVisibilityToggle() {
    return $(testId('toggle-password-visibility'));
  }

  get loginButton() {
    return $(testId('login-button'));
  }

  get errorMessage() {
    return $(testId('login-error-message'));
  }

  get passwordHint() {
    return $(testId('hint-password'));
  }

  get practiceAccountButtons() {
    return $$(testIdPrefix('hint-user-'));
  }

  practiceAccountButton(username: string) {
    return $(testId(`hint-user-${username}`));
  }

  // A full page load, so every test starts logged out with an empty cart.
  // 30s allows for the hosted app being slow to wake up.
  async open(): Promise<this> {
    log.info('Opening the login page');
    await browser.url('/login');
    return this.waitForLoaded(30_000);
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.typeInto(this.usernameInput, username);
    await this.typeInto(this.passwordInput, password);
  }

  // The app waits about 600ms before answering, so wait for the result.
  async login(username: string, password: string): Promise<void> {
    log.info(`Logging in as "${username || '<empty>'}"`);
    await this.fillCredentials(username, password);
    await this.closeKeyboard();
    await this.loginButton.click();
    await this.waitForLoginOutcome();
  }

  async loginAs(user: User): Promise<void> {
    await this.login(user.username, user.password);
    await InventoryPage.waitForLoaded();
  }

  async getErrorText(): Promise<string> {
    await this.errorMessage.waitForDisplayed({ timeoutMsg: 'Expected a login error message' });
    return this.errorMessage.getText();
  }

  async getListedPracticeUsernames(): Promise<string[]> {
    return this.practiceAccountButtons.map(async (button) =>
      ((await button.getAttribute('data-test')) ?? '').replace('hint-user-', ''),
    );
  }

  async usePracticeAccount(username: string): Promise<void> {
    await this.practiceAccountButton(username).click();
  }

  private async typeInto(input: ReturnType<typeof $>, value: string): Promise<void> {
    await input.clearValue();
    if (value) await input.setValue(value);
  }

  private async waitForLoginOutcome(): Promise<void> {
    await browser.waitUntil(
      async () => !(await this.rootElement.isExisting()) || (await this.errorMessage.isDisplayed()),
      { timeoutMsg: 'Login neither navigated away nor displayed an error' },
    );
  }
}

export default new LoginPage();
