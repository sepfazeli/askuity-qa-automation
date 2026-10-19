import { log } from '../utils/logger';
import { parseMoney, type OrderTotals } from '../utils/money';
import { PAGE_ROOT, testId } from '../utils/selectors';
import { BasePage } from './base.page';
import CheckoutCompletePage from './checkout-complete.page';
import type { CartLine } from './components/cart-item.component';

class CheckoutOverviewPage extends BasePage {
  protected readonly root = PAGE_ROOT.checkoutOverview;

  get title() {
    return $(testId('checkout-title'));
  }

  get rows() {
    return $$(testId('checkout-item'));
  }

  get shippingInfo() {
    return $(testId('shipping-info'));
  }

  get subtotal() {
    return $(testId('checkout-subtotal'));
  }

  get tax() {
    return $(testId('checkout-tax'));
  }

  get total() {
    return $(testId('checkout-total'));
  }

  get finishButton() {
    return $(testId('finish-button'));
  }

  get backButton() {
    return $(testId('back-to-form'));
  }

  async getLines(): Promise<CartLine[]> {
    return this.rows.map(async (row) => {
      const qtyText = await row.$(testId('checkout-item-qty')).getText(); // "Qty: 2 × $9.99"
      const quantity = qtyText.match(/Qty:\s*(\d+)/);
      if (!quantity) throw new Error(`Unexpected quantity text "${qtyText}"`);
      return {
        productId: Number(((await row.getAttribute('id')) ?? '').replace('checkout-item-', '')),
        name: await row.$(testId('checkout-item-name')).getText(),
        unitPrice: parseMoney(qtyText),
        quantity: Number(quantity[1]),
        lineTotal: parseMoney(await row.$(testId('checkout-item-subtotal')).getText()),
      };
    });
  }

  async getTotals(): Promise<OrderTotals> {
    return {
      subtotal: parseMoney(await this.subtotal.getText()),
      tax: parseMoney(await this.tax.getText()),
      total: parseMoney(await this.total.getText()),
    };
  }

  async finish(): Promise<typeof CheckoutCompletePage> {
    log.info('Placing the order (Finish)');
    await this.finishButton.click();
    return CheckoutCompletePage.waitForLoaded();
  }

  async backToInformation(): Promise<void> {
    await this.backButton.click();
    await $(PAGE_ROOT.checkoutInformation).waitForDisplayed();
  }
}

export default new CheckoutOverviewPage();
