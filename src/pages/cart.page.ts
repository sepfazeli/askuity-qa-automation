import type { Product } from '../data/products';
import { log } from '../utils/logger';
import { parseMoney, type OrderTotals } from '../utils/money';
import { PAGE_ROOT, testId } from '../utils/selectors';
import { BasePage } from './base.page';
import CheckoutInformationPage from './checkout-information.page';
import { CartItem, type CartLine } from './components/cart-item.component';
import InventoryPage from './inventory.page';

class CartPage extends BasePage {
  protected readonly root = PAGE_ROOT.cart;

  get title() {
    return $(testId('cart-title'));
  }

  get emptyTitle() {
    return $(testId('cart-empty-title'));
  }

  get emptyMessage() {
    return $(testId('cart-empty-message'));
  }

  // On the empty cart.
  get emptyContinueShoppingButton() {
    return $(testId('continue-shopping'));
  }

  // Under the order summary when the cart has items.
  get continueShoppingLink() {
    return $(testId('continue-shopping-link'));
  }

  get rows() {
    return $$(testId('cart-item'));
  }

  get subtotal() {
    return $(testId('cart-subtotal'));
  }

  get tax() {
    return $(testId('cart-tax'));
  }

  // The "Tax (8%)" label.
  get taxLabel() {
    return this.tax.previousElement();
  }

  get total() {
    return $(testId('cart-total'));
  }

  get checkoutButton() {
    return $(testId('checkout-button'));
  }

  item(product: Product): CartItem {
    return new CartItem(product.id);
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyTitle.isDisplayed();
  }

  // From the "Your Cart (N items)" heading.
  async getTitleItemCount(): Promise<number> {
    const text = await this.title.getText();
    const match = text.match(/\((\d+)\s+items?\)/);
    if (!match) throw new Error(`Unexpected cart title "${text}"`);
    return Number(match[1]);
  }

  async getLines(): Promise<CartLine[]> {
    const ids = await this.rows.map(async (row) =>
      Number(((await row.getAttribute('data-test-item-id')) ?? '').replace('cart-item-', '')),
    );
    const lines: CartLine[] = [];
    for (const id of ids) lines.push(await new CartItem(id).getDetails());
    return lines;
  }

  async getTotals(): Promise<OrderTotals> {
    return {
      subtotal: parseMoney(await this.subtotal.getText()),
      tax: parseMoney(await this.tax.getText()),
      total: parseMoney(await this.total.getText()),
    };
  }

  async proceedToCheckout(): Promise<typeof CheckoutInformationPage> {
    log.info('Proceeding to checkout');
    await this.checkoutButton.click();
    return CheckoutInformationPage.waitForLoaded();
  }

  async continueShopping(): Promise<typeof InventoryPage> {
    const button = (await this.isEmpty()) ? this.emptyContinueShoppingButton : this.continueShoppingLink;
    await button.click();
    return InventoryPage.waitForLoaded();
  }
}

export default new CartPage();
