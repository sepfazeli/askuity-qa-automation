import { log } from '../utils/logger';
import { parseMoney } from '../utils/money';
import { PAGE_ROOT, testId, testIdPrefix } from '../utils/selectors';
import { BasePage } from './base.page';

class ProductDetailPage extends BasePage {
  protected readonly root = PAGE_ROOT.productDetail;

  get name() {
    return $(testId('product-detail-name'));
  }

  get price() {
    return $(testId('product-detail-price'));
  }

  get category() {
    return $(testId('product-category'));
  }

  get image() {
    return $(`${testId('product-image-container')} svg`);
  }

  get addToCartButton() {
    return this.rootElement.$(testIdPrefix('add-to-cart-'));
  }

  get viewCartButton() {
    return $(testId('view-cart-button'));
  }

  async getPrice(): Promise<number> {
    return parseMoney(await this.price.getText());
  }

  async addToCart(): Promise<void> {
    log.info(`Clicking "Add to Cart" on the detail page of "${await this.name.getText()}"`);
    await this.addToCartButton.click();
  }
}

export default new ProductDetailPage();
