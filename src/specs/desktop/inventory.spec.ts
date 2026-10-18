import { expect } from '@wdio/globals';
import {
  ALL_CATEGORIES_OPTION,
  DEFAULT_SORT,
  MESSAGES,
  SORT_OPTIONS,
  type SortOption,
} from '../../data/constants';
import { CATEGORIES, PRODUCTS, productByName, productsInCategory } from '../../data/products';
import { USERS } from '../../data/users';
import { loginAs } from '../../flows/shopping.flow';
import { InventoryPage } from '../../pages';
import type { DisplayedProduct } from '../../pages/inventory.page';

function sortedCopy(products: DisplayedProduct[], option: SortOption): DisplayedProduct[] {
  const direction = option.direction === 'asc' ? 1 : -1;
  return [...products].sort((a, b) =>
    option.by === 'name' ? a.name.localeCompare(b.name) * direction : (a.price - b.price) * direction,
  );
}

const capitalise = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

describe('Products page', () => {
  beforeEach(async () => {
    await loginAs(USERS.standard);
  });

  it('@smoke TC-INV-01 shows the total number of products, matching the results counter', async () => {
    expect(await InventoryPage.getProductCount()).toBe(PRODUCTS.length);
    expect(await InventoryPage.getResultCountLabel()).toBe(PRODUCTS.length);
  });

  it('TC-INV-02 displays every catalogue product with its correct price', async () => {
    const displayed = await InventoryPage.getDisplayedProducts();

    const byName = (a: DisplayedProduct, b: DisplayedProduct) => a.name.localeCompare(b.name);
    expect([...displayed].sort(byName)).toEqual(
      PRODUCTS.map(({ name, price }) => ({ name, price })).sort(byName),
    );
  });

  describe('Filtering by category', () => {
    it('TC-INV-03 offers "All categories" plus every product category', async () => {
      const options = await InventoryPage.getCategoryOptions();

      expect(options).toEqual([
        ALL_CATEGORIES_OPTION,
        ...CATEGORIES.map((category) => ({ value: category, label: capitalise(category) })),
      ]);
    });

    for (const category of CATEGORIES) {
      const expected = productsInCategory(category);

      it(`TC-INV-04 "${category}" shows exactly its ${expected.length} product(s)`, async () => {
        await InventoryPage.filterByCategory(category);

        const names = await InventoryPage.getProductNames();
        expect(names).toHaveLength(expected.length);
        expect(await InventoryPage.getResultCountLabel()).toBe(expected.length);
        expect([...names].sort()).toEqual(expected.map((p) => p.name).sort());
        for (const name of names) expect(productByName(name).category).toBe(category);
      });
    }

    it('TC-INV-05 switching back to "All categories" restores the full list', async () => {
      await InventoryPage.filterByCategory('books');
      await InventoryPage.filterByCategory('all');

      expect(await InventoryPage.getProductCount()).toBe(PRODUCTS.length);
    });
  });

  describe('Sorting', () => {
    it('TC-INV-06 offers the four sort options and defaults to Name (A to Z)', async () => {
      expect(await InventoryPage.getSortOptions()).toEqual(
        SORT_OPTIONS.map(({ value, label }) => ({ value, label })),
      );
      expect(await InventoryPage.getSelectedSort()).toBe(DEFAULT_SORT.value);

      const displayed = await InventoryPage.getDisplayedProducts();
      expect(displayed.map((p) => p.name)).toEqual(sortedCopy(displayed, DEFAULT_SORT).map((p) => p.name));
    });

    for (const option of SORT_OPTIONS) {
      const tag = option.value === 'price-high' ? '@known-bug BUG-001 ' : '';

      it(`${tag}TC-INV-07 "${option.label}" orders the products correctly`, async () => {
        await InventoryPage.sortBy(option);

        const displayed = await InventoryPage.getDisplayedProducts();
        const expected = sortedCopy(displayed, option);
        expect(displayed).toHaveLength(PRODUCTS.length);
        // Two products cost $15.99, so price sorts only compare the prices.
        if (option.by === 'name') {
          expect(displayed.map((p) => p.name)).toEqual(expected.map((p) => p.name));
        } else {
          expect(displayed.map((p) => p.price)).toEqual(expected.map((p) => p.price));
        }
      });
    }

    it('TC-INV-08 sorting applies within a filtered category', async () => {
      const priceLowToHigh = SORT_OPTIONS.find((o) => o.value === 'price-low')!;
      await InventoryPage.filterByCategory('apparel');
      await InventoryPage.sortBy(priceLowToHigh);

      const displayed = await InventoryPage.getDisplayedProducts();
      expect(displayed).toHaveLength(productsInCategory('apparel').length);
      expect(displayed.map((p) => p.price)).toEqual(
        sortedCopy(displayed, priceLowToHigh).map((p) => p.price),
      );
    });
  });

  describe('Searching', () => {
    it('TC-INV-09 narrows results by keyword', async () => {
      await InventoryPage.search('tee');

      const names = await InventoryPage.getProductNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names.length).toBeLessThan(PRODUCTS.length);
      expect(names).toContain('Side Quest Tee');
    });

    it('TC-INV-10 shows an empty state for no matches and "Clear filters" resets everything', async () => {
      await InventoryPage.filterByCategory('gear');
      await InventoryPage.search('no-such-product-xyz');

      await expect(InventoryPage.emptyState).toBeDisplayed();
      await expect(InventoryPage.emptyState).toHaveText(
        expect.stringContaining(MESSAGES.inventory.emptyState),
      );
      expect(await InventoryPage.getProductCount()).toBe(0);

      await InventoryPage.clearFilters();

      expect(await InventoryPage.getProductCount()).toBe(PRODUCTS.length);
      expect(await InventoryPage.getSelectedCategory()).toBe('all');
      await expect(InventoryPage.searchInput).toHaveValue('');
    });
  });
});
