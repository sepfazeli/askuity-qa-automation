import { expect } from '@wdio/globals';
import { productByName } from '../../data/products';
import { USERS } from '../../data/users';
import { loginAs, openCartWith } from '../../flows/shopping.flow';
import { CartPage, InventoryPage, LoginPage } from '../../pages';

describe('Practice account variations', () => {
  it('@known-bug BUG-006 TC-VAR-01 "lens_warp" sees the same product images as the standard shopper', async () => {
    await loginAs(USERS.standard);
    const reference = await InventoryPage.getImageMarkupByName();
    await InventoryPage.header.logout();

    await LoginPage.loginAs(USERS.imageVariation);
    const actual = await InventoryPage.getImageMarkupByName();

    expect(Object.keys(actual).sort()).toEqual(Object.keys(reference).sort());
    const mismatched = Object.keys(reference).filter((name) => actual[name] !== reference[name]);
    expect(mismatched).toEqual([]);
  });

  it('@known-bug BUG-005 TC-VAR-02 "count_echo" cart badge matches the number of items in the cart', async () => {
    await loginAs(USERS.cartBadge);
    expect(await InventoryPage.header.getCartBadgeCount()).toBe(0);

    await openCartWith(productByName('Daybreak Ceramic Mug'), productByName('Gridline Journal'));

    expect(await CartPage.header.getCartBadgeCount()).toBe(await CartPage.getTitleItemCount());
  });
});
