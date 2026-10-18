import { PAGE_ROOT, testId } from '../support/selectors';
import { BasePage } from './base.page';
import InventoryPage from './inventory.page';

class CheckoutCompletePage extends BasePage {
  protected readonly root = PAGE_ROOT.checkoutComplete;

  get title() {
    return $(testId('checkout-success-title'));
  }

  get message() {
    return $(testId('checkout-success-message'));
  }

  get continueShoppingButton() {
    return $(testId('back-to-home'));
  }

  async continueShopping(): Promise<typeof InventoryPage> {
    await this.continueShoppingButton.click();
    return InventoryPage.waitForLoaded();
  }
}

export default new CheckoutCompletePage();
