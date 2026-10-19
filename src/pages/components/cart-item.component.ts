import { log } from '../../utils/logger';
import { parseMoney } from '../../utils/money';
import { itemId, testId, testIdPrefix } from '../../utils/selectors';
import { waitUntilEqual } from '../../utils/wait';

export interface CartLine {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

// Found by product id, so it keeps working after re-renders.
export class CartItem {
  constructor(readonly productId: number) {}

  get root() {
    return $(itemId(`cart-item-${this.productId}`));
  }

  get name() {
    return this.root.$(testId('cart-item-name'));
  }

  get unitPrice() {
    return this.root.$(testId('cart-item-price'));
  }

  get quantityValue() {
    return this.root.$(testIdPrefix('quantity-item-'));
  }

  get lineTotal() {
    return this.root.$(testIdPrefix('cart-item-total-'));
  }

  get increaseButton() {
    return this.root.$(testIdPrefix('increase-qty-item-'));
  }

  get decreaseButton() {
    return this.root.$(testIdPrefix('decrease-qty-item-'));
  }

  get removeButton() {
    return this.root.$(testIdPrefix('remove-item-'));
  }

  async getQuantity(): Promise<number> {
    return Number(await this.quantityValue.getText());
  }

  // Waits until the quantity has actually changed.
  async increase(): Promise<void> {
    const before = await this.getQuantity();
    log.info(`Increasing quantity of product ${this.productId} from ${before}`);
    await this.increaseButton.click();
    await waitUntilEqual(() => this.getQuantity(), before + 1, `quantity of product ${this.productId}`);
  }

  // At quantity 1 the row disappears instead.
  async decrease(): Promise<void> {
    const before = await this.getQuantity();
    log.info(`Decreasing quantity of product ${this.productId} from ${before}`);
    await this.decreaseButton.click();
    if (before > 1) {
      await waitUntilEqual(() => this.getQuantity(), before - 1, `quantity of product ${this.productId}`);
    } else {
      await this.root.waitForExist({ reverse: true, timeoutMsg: `Row ${this.productId} was not removed` });
    }
  }

  async remove(): Promise<void> {
    log.info(`Removing product ${this.productId} from the cart`);
    await this.removeButton.click();
    await this.root.waitForExist({ reverse: true, timeoutMsg: `Row ${this.productId} was not removed` });
  }

  async getDetails(): Promise<CartLine> {
    return {
      productId: this.productId,
      name: await this.name.getText(),
      unitPrice: parseMoney(await this.unitPrice.getText()),
      quantity: await this.getQuantity(),
      lineTotal: parseMoney(await this.lineTotal.getText()),
    };
  }
}
