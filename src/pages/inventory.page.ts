import type { SortOption } from '../data/constants';
import type { Category, Product } from '../data/products';
import { log } from '../support/logger';
import { parseMoney } from '../support/money';
import { PAGE_ROOT, testId } from '../support/selectors';
import { waitUntilEqual } from '../support/wait';
import { BasePage } from './base.page';
import { ProductCard } from './components/product-card.component';
import ProductDetailPage from './product-detail.page';

export interface DisplayedProduct {
  name: string;
  price: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

class InventoryPage extends BasePage {
  protected readonly root = PAGE_ROOT.inventory;

  get heading() {
    return $(testId('inventory-title'));
  }

  // This counter has no data-test attribute, so it's found by its text.
  get resultCountLabel() {
    return this.rootElement.$('p*=items to explore');
  }

  get searchInput() {
    return $(testId('search-products'));
  }

  get categorySelect() {
    return $(testId('filter-category'));
  }

  get sortSelect() {
    return $(testId('sort-select'));
  }

  get productTiles() {
    return $$(testId('inventory-item'));
  }

  get productNames() {
    return $$(`${testId('inventory-item')} ${testId('inventory-item-name')}`);
  }

  get productPrices() {
    return $$(`${testId('inventory-item')} ${testId('inventory-item-price')}`);
  }

  get emptyState() {
    return $(testId('inventory-empty-state'));
  }

  get clearFiltersButton() {
    return $(testId('clear-filters'));
  }

  card(product: Product): ProductCard {
    return ProductCard.for(product);
  }

  // Negative index counts from the end (-1 = last).
  async cardAt(index: number): Promise<ProductCard> {
    const tiles = await this.productTiles.getElements();
    const tile = tiles.at(index);
    if (!tile) throw new Error(`No product tile at index ${index} (found ${tiles.length})`);
    const id = ((await tile.getAttribute('data-test-item-id')) ?? '').replace('inventory-item-', '');
    return new ProductCard(Number(id));
  }

  async getProductCount(): Promise<number> {
    return (await this.productTiles.getElements()).length;
  }

  async getResultCountLabel(): Promise<number> {
    const text = await this.resultCountLabel.getText();
    const match = text.match(/(\d+)\s+items?/);
    if (!match) throw new Error(`Unexpected result counter text "${text}"`);
    return Number(match[1]);
  }

  async getProductNames(): Promise<string[]> {
    return this.productNames.map((el) => el.getText());
  }

  async getProductPrices(): Promise<number[]> {
    return this.productPrices.map(async (el) => parseMoney(await el.getText()));
  }

  async getDisplayedProducts(): Promise<DisplayedProduct[]> {
    const names = await this.getProductNames();
    const prices = await this.getProductPrices();
    return names.map((name, i) => ({ name, price: prices[i] }));
  }

  async getCategoryOptions(): Promise<SelectOption[]> {
    return this.readOptions(this.categorySelect);
  }

  async getSortOptions(): Promise<SelectOption[]> {
    return this.readOptions(this.sortSelect);
  }

  async getSelectedSort(): Promise<string> {
    return this.selectedValue(this.sortSelect);
  }

  async getSelectedCategory(): Promise<string> {
    return this.selectedValue(this.categorySelect);
  }

  async filterByCategory(category: Category | 'all'): Promise<void> {
    log.info(`Filtering by category "${category}"`);
    await this.categorySelect.selectByAttribute('value', category);
    await waitUntilEqual(() => this.getSelectedCategory(), category, 'the selected category');
    await this.waitForResultsToSettle();
  }

  async sortBy(option: SortOption): Promise<void> {
    log.info(`Sorting by "${option.label}"`);
    await this.sortSelect.selectByAttribute('value', option.value);
    await waitUntilEqual(() => this.getSelectedSort(), option.value, 'the selected sort option');
    await this.waitForResultsToSettle();
  }

  async search(term: string): Promise<void> {
    log.info(`Searching for "${term}"`);
    await this.searchInput.setValue(term);
    await this.waitForResultsToSettle();
  }

  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
    await this.waitForResultsToSettle();
  }

  async openProduct(product: Product): Promise<typeof ProductDetailPage> {
    await this.card(product).openDetails();
    return ProductDetailPage.waitForLoaded();
  }

  // Product name -> image markup, read in one browser call.
  async getImageMarkupByName(): Promise<Record<string, string>> {
    return browser.execute(
      (tileSelector: string, nameSelector: string) =>
        Object.fromEntries(
          Array.from(document.querySelectorAll(tileSelector)).map((tile) => [
            tile.querySelector(nameSelector)?.textContent?.trim() ?? '',
            tile.querySelector('a[href^="/product/"] svg')?.innerHTML ?? '',
          ]),
        ),
      testId('inventory-item'),
      testId('inventory-item-name'),
    );
  }

  // Wait until the counter matches the number of tiles before reading the list.
  private async waitForResultsToSettle(): Promise<void> {
    await browser.waitUntil(
      async () => (await this.getResultCountLabel()) === (await this.getProductCount()),
      { timeoutMsg: 'Product grid did not settle: counter and rendered tiles disagree' },
    );
  }

  // Read with JavaScript because real-device drivers disagree: getValue() is empty on Android Chrome
  // and getProperty('value') is undefined on iOS Safari.
  private async selectedValue(select: ReturnType<typeof $>): Promise<string> {
    const element = await select.getElement();
    return browser.execute((el: HTMLSelectElement) => el.value, element as unknown as HTMLSelectElement);
  }

  private async readOptions(select: ReturnType<typeof $>): Promise<SelectOption[]> {
    return select.$$('option').map(async (option) => ({
      value: (await option.getAttribute('value')) ?? '',
      label: await option.getText(),
    }));
  }
}

export default new InventoryPage();
