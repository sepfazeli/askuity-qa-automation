import type { Product } from '../../data/products';
import { log } from '../../utils/logger';
import { parseMoney } from '../../utils/money';
import { itemId, testId, testIdPrefix } from '../../utils/selectors';
import { waitUntilEqual } from '../../utils/wait';

// Found by product id, so it keeps working after the grid re-renders.
export class ProductCard {
  constructor(readonly productId: number) {}

  static for(product: Product): ProductCard {
    return new ProductCard(product.id);
  }

  get root() {
    return $(itemId(`inventory-item-${this.productId}`));
  }

  get nameLink() {
    return this.root.$(testId('inventory-item-name'));
  }

  get price() {
    return this.root.$(testId('inventory-item-price'));
  }

  get image() {
    return this.root.$('a[href^="/product/"] svg');
  }

  get quantityValue() {
    return this.root.$(testIdPrefix('qty-value-'));
  }

  get increaseQuantityButton() {
    return this.root.$(testIdPrefix('qty-increase-'));
  }

  get decreaseQuantityButton() {
    return this.root.$(testIdPrefix('qty-decrease-'));
  }

  get addToCartButton() {
    return this.root.$(testIdPrefix('add-to-cart-'));
  }

  async getName(): Promise<string> {
    return this.nameLink.getText();
  }

  async getPrice(): Promise<number> {
    return parseMoney(await this.price.getText());
  }

  async getQuantity(): Promise<number> {
    return Number(await this.quantityValue.getText());
  }

  // Sets the quantity with the tile's own +/- buttons.
  async setQuantity(target: number): Promise<void> {
    let current = await this.getQuantity();
    while (current !== target) {
      const button = current < target ? this.increaseQuantityButton : this.decreaseQuantityButton;
      const next = current < target ? current + 1 : current - 1;
      await button.click();
      await waitUntilEqual(() => this.getQuantity(), next, `quantity selector for product ${this.productId}`);
      current = next;
    }
  }

  async addToCart(): Promise<void> {
    log.info(`Clicking "Add to Cart" for product ${this.productId}`);
    await this.addToCartButton.click();
  }

  async openDetails(): Promise<void> {
    await this.nameLink.click();
  }
}
