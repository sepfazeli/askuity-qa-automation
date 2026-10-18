import { expect } from '@wdio/globals';
import { MESSAGES } from '../../data/constants';
import { INVALID_CREDENTIALS, PRACTICE_USERS, USERS } from '../../data/users';
import { loginAs } from '../../flows/shopping.flow';
import { CartPage, InventoryPage, LoginPage } from '../../pages';
import { PAGE_ROOT } from '../../support/selectors';

describe('Login', () => {
  beforeEach(async () => {
    await LoginPage.open();
  });

  it('TC-LOGIN-01 lists every practice account and the shared password', async () => {
    const listed = await LoginPage.getListedPracticeUsernames();

    expect(listed).toEqual(PRACTICE_USERS.map((user) => user.username));
    await expect(LoginPage.passwordHint).toHaveText(USERS.standard.password);
  });

  describe('TC-LOGIN-02 each listed practice account', () => {
    for (const user of PRACTICE_USERS.filter((u) => u.canLogin)) {
      it(`@smoke "${user.username}" (${user.label}) can log in and reach the inventory`, async () => {
        await LoginPage.login(user.username, user.password);

        await InventoryPage.waitForLoaded();
        await expect(browser).toHaveUrl(expect.stringMatching(/\/$/));
        await expect(InventoryPage.header.loggedInUser).toHaveText(user.username);
      });
    }

    for (const user of PRACTICE_USERS.filter((u) => !u.canLogin)) {
      it(`"${user.username}" (${user.label}) cannot log in and sees why`, async () => {
        await LoginPage.login(user.username, user.password);

        expect(await LoginPage.getErrorText()).toContain(user.expectedError);
        await expect(LoginPage.rootElement).toBeDisplayed();
        await expect(InventoryPage.rootElement).not.toBeExisting();
      });
    }
  });

  describe('TC-LOGIN-03 rejects invalid credentials', () => {
    for (const { scenario, username, password, expectedError } of INVALID_CREDENTIALS) {
      it(`with ${scenario}`, async () => {
        await LoginPage.login(username, password);

        expect(await LoginPage.getErrorText()).toContain(expectedError);
        await expect(InventoryPage.rootElement).not.toBeExisting();
      });
    }
  });

  describe('TC-LOGIN-04 validates required fields', () => {
    it('asks for the username when it is missing', async () => {
      await LoginPage.login('', USERS.standard.password);

      expect(await LoginPage.getErrorText()).toContain(MESSAGES.login.usernameRequired);
    });

    it('@known-bug BUG-004 asks for the password when only the password is missing', async () => {
      await LoginPage.login(USERS.standard.username, '');

      expect(await LoginPage.getErrorText()).toContain(MESSAGES.login.passwordRequired);
    });
  });

  it('TC-LOGIN-05 "tap to fill" practice account populates the credentials', async () => {
    await LoginPage.usePracticeAccount(USERS.cartBadge.username);

    await expect(LoginPage.usernameInput).toHaveValue(USERS.cartBadge.username);
    await expect(LoginPage.passwordInput).toHaveValue(USERS.cartBadge.password);
  });

  it('TC-LOGIN-06 masks the password and can reveal it on demand', async () => {
    await LoginPage.fillCredentials(USERS.standard.username, USERS.standard.password);
    await expect(LoginPage.passwordInput).toHaveAttribute('type', 'password');

    await LoginPage.passwordVisibilityToggle.click();

    await expect(LoginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  it('TC-LOGIN-07 logging out ends the session and protected pages redirect to login', async () => {
    await loginAs(USERS.standard);

    await InventoryPage.header.logout();
    await browser.url('/cart');

    await expect($(PAGE_ROOT.login)).toBeDisplayed();
    await expect(browser).toHaveUrl(expect.stringContaining('/login'));
    await expect(CartPage.rootElement).not.toBeExisting();
  });
});
