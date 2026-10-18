import { expect } from '@wdio/globals';
import { BREAKPOINTS, expectedGridColumns, isCompactHeader } from '../../data/breakpoints';
import { MESSAGES, SORT_OPTIONS } from '../../data/constants';
import { productsInCategory } from '../../data/products';
import { buildShippingInfo } from '../../data/shipping';
import { USERS } from '../../data/users';
import { addToCart, loginAs, productsFromBothEnds } from '../../flows/shopping.flow';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
  LoginPage,
} from '../../pages';
import {
  columnCount,
  hasHorizontalOverflow,
  isHorizontallyInViewport,
  viewportWidth,
} from '../../support/layout';
import { calculateOrderTotals } from '../../support/money';
import { testId } from '../../support/selectors';

async function expectFitsScreen(): Promise<void> {
  expect(await hasHorizontalOverflow()).toBe(false);
}

describe('Mobile responsive', () => {
  let width: number;

  before(async () => {
    await LoginPage.open();
    console.log(`Screen width: ${await viewportWidth()}px`);
  });

  beforeEach(async () => {
    await LoginPage.open();
    width = await viewportWidth();
  });

  it('TC-MOB-01 login page fits the screen and a shopper can sign in', async () => {
    // Fails if the test is running at desktop width instead of on a phone or tablet.
    expect(width).toBeLessThan(BREAKPOINTS.lg);
    await expectFitsScreen();
    expect(await isHorizontallyInViewport(await LoginPage.loginButton.getElement())).toBe(true);

    await LoginPage.loginAs(USERS.standard);

    await expect(InventoryPage.heading).toBeDisplayed();
  });

  it('TC-MOB-02 products page adapts its grid and header to the screen width', async () => {
    await LoginPage.loginAs(USERS.standard);

    await expectFitsScreen();
    expect(await columnCount(testId('inventory-item'))).toBe(expectedGridColumns(width));

    // On phones these turn into icons, but they must still be there.
    await expect(InventoryPage.header.cartLink).toBeDisplayed();
    await expect(InventoryPage.header.logoutButton).toBeDisplayed();
    await expect(InventoryPage.header.logoutButton).toHaveAttribute('aria-label', 'Log out');
    const compact = isCompactHeader(width);
    expect(await InventoryPage.header.usernameLabel.isDisplayed()).toBe(!compact);
    expect(await InventoryPage.header.logoutLabel.isDisplayed()).toBe(!compact);
  });

  it('TC-MOB-03 filtering and sorting work on a touch screen', async () => {
    const priceLowToHigh = SORT_OPTIONS.find((o) => o.value === 'price-low')!;
    await LoginPage.loginAs(USERS.standard);

    await InventoryPage.filterByCategory('accessories');
    await InventoryPage.sortBy(priceLowToHigh);

    const prices = await InventoryPage.getProductPrices();
    expect(prices).toHaveLength(productsInCategory('accessories').length);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    await expectFitsScreen();
  });

  it('TC-MOB-04 cart quantity controls and totals work on mobile', async () => {
    await loginAs(USERS.standard);
    const [top, bottom] = await productsFromBothEnds(1);
    await addToCart(top, bottom);
    await InventoryPage.header.openCart();

    await CartPage.item(top).increase();
    await CartPage.item(bottom).increase();
    await CartPage.item(bottom).decrease();

    expect(await CartPage.getTitleItemCount()).toBe(3);
    expect(await CartPage.getTotals()).toEqual(
      calculateOrderTotals([
        { unitPrice: top.price, quantity: 2 },
        { unitPrice: bottom.price, quantity: 1 },
      ]),
    );
    await expectFitsScreen();
    await CartPage.checkoutButton.scrollIntoView({ block: 'center' });
    expect(await isHorizontallyInViewport(await CartPage.checkoutButton.getElement())).toBe(true);
  });

  it('TC-MOB-05 a complete checkout can be placed on mobile', async () => {
    await loginAs(USERS.standard);
    const [top, bottom] = await productsFromBothEnds(1);
    await addToCart(top, bottom);
    await InventoryPage.header.openCart();
    const cartTotals = await CartPage.getTotals();

    await CartPage.proceedToCheckout();
    await expectFitsScreen();
    await CheckoutInformationPage.submitShippingInfo(buildShippingInfo());
    await expectFitsScreen();
    expect(await CheckoutOverviewPage.getTotals()).toEqual(cartTotals);
    await CheckoutOverviewPage.finish();

    await expect(CheckoutCompletePage.title).toHaveText(MESSAGES.complete.title);
    await expectFitsScreen();
  });
});
