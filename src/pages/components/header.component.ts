import { log } from '../../utils/logger';
import { PAGE_ROOT, testId } from '../../utils/selectors';
import { waitUntilEqual } from '../../utils/wait';

export class HeaderComponent {
  get root() {
    return $(testId('header'));
  }

  get shopLink() {
    return $(testId('nav-inventory'));
  }

  get cartLink() {
    return $(testId('nav-cart'));
  }

  get cartBadge() {
    return $(testId('cart-badge'));
  }

  get loggedInUser() {
    return $(testId('logged-in-user'));
  }

  get logoutButton() {
    return $(testId('logout-button'));
  }

  // Hidden on phones.
  get usernameLabel() {
    return this.loggedInUser.$('span');
  }

  // Hidden on phones.
  get logoutLabel() {
    return this.logoutButton.$('span');
  }

  // 0 when the badge is hidden.
  async getCartBadgeCount(): Promise<number> {
    if (!(await this.cartBadge.isExisting())) return 0;
    return Number(await this.cartBadge.getText());
  }

  async waitForCartBadgeCount(expected: number): Promise<void> {
    await waitUntilEqual(() => this.getCartBadgeCount(), expected, 'the cart badge count');
  }

  async getLoggedInUsername(): Promise<string> {
    return this.loggedInUser.getText();
  }

  async openCart(): Promise<void> {
    log.info('Opening the cart from the header');
    await this.cartLink.click();
    await $(PAGE_ROOT.cart).waitForDisplayed({ timeoutMsg: 'Cart page did not open' });
  }

  async goToShop(): Promise<void> {
    await this.shopLink.click();
    await $(PAGE_ROOT.inventory).waitForDisplayed({ timeoutMsg: 'Inventory page did not open' });
  }

  async logout(): Promise<void> {
    log.info('Logging out');
    await this.logoutButton.click();
    await $(PAGE_ROOT.login).waitForDisplayed({ timeoutMsg: 'Login page did not appear after logout' });
  }
}
