import { expect } from '@wdio/globals';
import { TAX_RATE_PERCENT } from '../../data/constants';
import { PURCHASABLE_PRODUCTS, productByName } from '../../data/products';
import { USERS } from '../../data/users';
import { expectedOrderLines, loginAs, openCartWith, type CartRequest } from '../../flows/shopping.flow';
import { CartPage } from '../../pages';
import { calculateOrderTotals, lineTotal } from '../../utils/money';

const HOODIE = productByName('After Hours Hoodie');
const DAY_PACK = productByName('Trailmark Day Pack');
const SOCKS = productByName('Bug Hunt Crew Socks');
const DECALS = productByName('Branch Point Decals');

// $4.99 × 8% = $0.3992, which should round to $0.40.
const BASKETS: { name: string; items: CartRequest[] }[] = [
  { name: 'a single low-priced item (tax rounds up)', items: [{ product: DECALS, quantity: 1 }] },
  {
    name: 'several products with mixed quantities',
    items: [
      { product: HOODIE, quantity: 2 },
      { product: DAY_PACK, quantity: 1 },
      { product: SOCKS, quantity: 3 },
    ],
  },
  {
    name: 'every purchasable product once',
    items: PURCHASABLE_PRODUCTS.map((product) => ({ product, quantity: 1 })),
  },
];

describe('Pricing logic', () => {
  beforeEach(async () => {
    await loginAs(USERS.standard);
  });

  for (const basket of BASKETS) {
    it(`TC-PRICE-01 subtotal + ${TAX_RATE_PERCENT}% tax = total for ${basket.name}`, async () => {
      await openCartWith(...basket.items);
      const expected = calculateOrderTotals(expectedOrderLines(...basket.items));

      for (const line of await CartPage.getLines()) {
        expect(line.lineTotal).toBe(lineTotal(line));
      }
      expect(await CartPage.getTotals()).toEqual(expected);
    });
  }

  it(`TC-PRICE-02 labels the tax line with the ${TAX_RATE_PERCENT}% rate`, async () => {
    await openCartWith(HOODIE);

    await expect(CartPage.taxLabel).toHaveText(`Tax (${TAX_RATE_PERCENT}%)`);
  });

  it('TC-PRICE-03 recalculates totals after every quantity change and removal', async () => {
    const quantities = new Map([
      [HOODIE, 1],
      [SOCKS, 2],
    ]);
    const expectedTotals = () =>
      calculateOrderTotals(
        [...quantities].map(([product, quantity]) => ({ unitPrice: product.price, quantity })),
      );

    await openCartWith(HOODIE, { product: SOCKS, quantity: 2 });
    expect(await CartPage.getTotals()).toEqual(expectedTotals());

    await CartPage.item(HOODIE).increase();
    quantities.set(HOODIE, 2);
    expect(await CartPage.getTotals()).toEqual(expectedTotals());

    await CartPage.item(SOCKS).decrease();
    quantities.set(SOCKS, 1);
    expect(await CartPage.getTotals()).toEqual(expectedTotals());

    await CartPage.item(HOODIE).remove();
    quantities.delete(HOODIE);
    expect(await CartPage.getTotals()).toEqual(expectedTotals());
  });
});
