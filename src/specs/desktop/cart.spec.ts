import { expect } from '@wdio/globals';
import { ITEM_INTERACTION_LIMIT, MESSAGES } from '../../data/constants';
import { PRODUCTS, productByName } from '../../data/products';
import { USERS } from '../../data/users';
import {
  addToCart,
  expectedOrderLines,
  loginAs,
  openCartWith,
  productsFromBothEnds,
} from '../../flows/shopping.flow';
import { CartPage, InventoryPage } from '../../pages';
import { calculateOrderTotals, lineTotal } from '../../utils/money';

const HOODIE = productByName('After Hours Hoodie');
const DAY_PACK = productByName('Trailmark Day Pack');
const MUG = productByName('Daybreak Ceramic Mug');

// Returns false instead of throwing, so a test can collect every product that fails to add.
async function badgeReaches(expected: number): Promise<boolean> {
  return browser
    .waitUntil(async () => (await InventoryPage.header.getCartBadgeCount()) === expected, { timeout: 3_000 })
    .then(() => true)
    .catch(() => false);
}

describe('Cart', () => {
  beforeEach(async () => {
    await loginAs(USERS.standard);
  });

  it('@smoke TC-CART-01 starts empty, and "Continue Shopping" returns to the products page', async () => {
    await expect(InventoryPage.header.cartBadge).not.toBeExisting();

    await InventoryPage.header.openCart();

    await expect(CartPage.emptyTitle).toHaveText(MESSAGES.cart.emptyTitle);
    await expect(CartPage.emptyMessage).toHaveText(MESSAGES.cart.emptyMessage);
    await expect(CartPage.rows).toBeElementsArrayOfSize(0);
    await expect(CartPage.checkoutButton).not.toBeExisting();

    await CartPage.continueShopping();

    expect(await InventoryPage.getProductCount()).toBe(PRODUCTS.length);
  });

  it('@smoke TC-CART-02 adds products from the top and bottom of the list and shows the right total', async () => {
    const picks = await productsFromBothEnds(2);

    await openCartWith(...picks);

    expect(await CartPage.header.getCartBadgeCount()).toBe(picks.length);
    expect(await CartPage.getTitleItemCount()).toBe(picks.length);
    expect(await CartPage.getLines()).toEqual(
      picks.map((p) => ({
        productId: p.id,
        name: p.name,
        unitPrice: p.price,
        quantity: 1,
        lineTotal: p.price,
      })),
    );
    // Subtotal of the catalogue prices plus 8% tax, calculated independently of the page.
    expect(await CartPage.getTotals()).toEqual(calculateOrderTotals(expectedOrderLines(...picks)));
  });

  it('TC-CART-03 (+) and (−) update the quantity, line total, item count and badge', async () => {
    await openCartWith(HOODIE, DAY_PACK);
    const hoodie = CartPage.item(HOODIE);

    await hoodie.increase();
    await hoodie.increase();

    expect(await hoodie.getDetails()).toMatchObject({
      quantity: 3,
      lineTotal: lineTotal({ unitPrice: HOODIE.price, quantity: 3 }),
    });
    expect(await CartPage.getTitleItemCount()).toBe(4);
    expect(await CartPage.header.getCartBadgeCount()).toBe(4);

    await hoodie.decrease();

    expect(await hoodie.getDetails()).toMatchObject({
      quantity: 2,
      lineTotal: lineTotal({ unitPrice: HOODIE.price, quantity: 2 }),
    });
    expect(await CartPage.getTitleItemCount()).toBe(3);
    expect(await CartPage.header.getCartBadgeCount()).toBe(3);
  });

  it('TC-CART-04 (−) at quantity 1 and the remove button both take the item out of the cart', async () => {
    await openCartWith(HOODIE, DAY_PACK);

    await CartPage.item(HOODIE).decrease();

    await expect(CartPage.item(HOODIE).root).not.toBeExisting();
    expect(await CartPage.getTitleItemCount()).toBe(1);

    await CartPage.item(DAY_PACK).remove();

    await expect(CartPage.emptyTitle).toHaveText(MESSAGES.cart.emptyTitle);
    expect(await CartPage.header.getCartBadgeCount()).toBe(0);
  });

  it('TC-CART-05 the quantity selector on a product tile adds that many units in one click', async () => {
    await openCartWith({ product: MUG, quantity: 3 });

    expect(await CartPage.getLines()).toEqual([
      {
        productId: MUG.id,
        name: MUG.name,
        unitPrice: MUG.price,
        quantity: 3,
        lineTotal: lineTotal({ unitPrice: MUG.price, quantity: 3 }),
      },
    ]);
    expect(await InventoryPage.header.getCartBadgeCount()).toBe(3);
  });

  it('TC-CART-06 cart contents are kept while navigating between pages', async () => {
    await openCartWith(HOODIE, { product: MUG, quantity: 2 });
    const before = await CartPage.getLines();

    await CartPage.continueShopping();
    await InventoryPage.header.openCart();

    expect(await CartPage.getLines()).toEqual(before);
  });

  it('@known-bug BUG-002 TC-CART-07 every product can be added to the cart from the products page', async () => {
    const notAdded: string[] = [];

    for (const product of PRODUCTS) {
      const before = await InventoryPage.header.getCartBadgeCount();
      await InventoryPage.card(product).addToCart();
      if (!(await badgeReaches(before + 1))) notAdded.push(product.name);
    }

    expect(notAdded).toEqual([]);
  });

  it('@known-bug BUG-002 TC-CART-08 every product can be added to the cart from its detail page', async () => {
    const notAdded: string[] = [];

    for (const product of PRODUCTS) {
      const before = await InventoryPage.header.getCartBadgeCount();
      const detailPage = await InventoryPage.openProduct(product);
      await detailPage.addToCart();
      if (!(await badgeReaches(before + 1))) notAdded.push(product.name);
      await detailPage.header.goToShop();
    }

    expect(notAdded).toEqual([]);
  });

  it(`@known-bug BUG-007 TC-CART-09 (+) keeps working beyond ${ITEM_INTERACTION_LIMIT} clicks on one item`, async () => {
    await openCartWith(MUG);
    const mug = CartPage.item(MUG);
    const clicks = ITEM_INTERACTION_LIMIT + 1;

    for (let i = 0; i < clicks; i++) await mug.increaseButton.click();

    await expect(CartPage.overloadBanner).not.toBeDisplayed({ wait: 0 });
    expect(await mug.getQuantity()).toBe(1 + clicks);
  });

  it('@known-bug BUG-009 TC-CART-10 the session and cart survive a page refresh', async () => {
    await addToCart(HOODIE, DAY_PACK);

    await browser.refresh();

    await expect(InventoryPage.rootElement).toBeDisplayed({ wait: 5_000 });
    expect(await InventoryPage.header.getCartBadgeCount()).toBe(2);
  });
});
