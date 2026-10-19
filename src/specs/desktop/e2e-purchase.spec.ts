import { expect } from '@wdio/globals';
import { MESSAGES } from '../../data/constants';
import { PRODUCTS, type Product } from '../../data/products';
import { buildShippingInfo } from '../../data/shipping';
import { USERS } from '../../data/users';
import { addToCart, loginAs, productsFromBothEnds } from '../../flows/shopping.flow';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
} from '../../pages';
import { calculateOrderTotals, lineTotal } from '../../utils/money';
import { step } from '../../utils/step';

// Exercise steps 1 to 7 in one session.
describe('End-to-end purchase journey', () => {
  it('@smoke TC-E2E-01 a shopper builds a cart, adjusts quantities, verifies pricing and checks out', async () => {
    const shipping = buildShippingInfo();
    const cart = new Map<Product, number>();
    const cartLines = () => [...cart].map(([product, quantity]) => ({ unitPrice: product.price, quantity }));
    const cartQuantity = () => [...cart.values()].reduce((sum, quantity) => sum + quantity, 0);

    await step('1. Log in with an accepted practice account', async () => {
      await loginAs(USERS.standard);
      await expect(InventoryPage.header.loggedInUser).toHaveText(USERS.standard.username);
    });

    await step('2. Products page lists every product', async () => {
      expect(await InventoryPage.getProductCount()).toBe(PRODUCTS.length);
      expect(await InventoryPage.getResultCountLabel()).toBe(PRODUCTS.length);
    });

    await step('3. Cart starts empty; Continue Shopping returns to the products', async () => {
      await InventoryPage.header.openCart();
      await expect(CartPage.emptyTitle).toHaveText(MESSAGES.cart.emptyTitle);
      await CartPage.continueShopping();
    });

    await step('4. Add products from the top and bottom of the list', async () => {
      const picks = await productsFromBothEnds(2);
      await addToCart(...picks);
      picks.forEach((product) => cart.set(product, 1));

      await InventoryPage.header.openCart();
      expect((await CartPage.getLines()).map((line) => line.name)).toEqual(picks.map((p) => p.name));
      expect(await CartPage.getTotals()).toEqual(calculateOrderTotals(cartLines()));
    });

    await step('5. Increase and decrease quantities with (+) and (−)', async () => {
      const [first, , , last] = [...cart.keys()];

      await CartPage.item(first).increase();
      await CartPage.item(first).increase();
      await CartPage.item(last).increase();
      await CartPage.item(first).decrease();
      cart.set(first, 2).set(last, 2);

      expect(await CartPage.item(first).getQuantity()).toBe(2);
      expect(await CartPage.item(last).getQuantity()).toBe(2);
      expect(await CartPage.getTitleItemCount()).toBe(cartQuantity());
      expect(await CartPage.header.getCartBadgeCount()).toBe(cartQuantity());
    });

    await step('6. Validate pricing: Σ(price × qty) + 8% tax = total', async () => {
      for (const line of await CartPage.getLines()) {
        expect(line.lineTotal).toBe(lineTotal(line));
      }
      expect(await CartPage.getTotals()).toEqual(calculateOrderTotals(cartLines()));
    });

    await step('7. Checkout: shipping info → order summary → finish → confirmation', async () => {
      await CartPage.proceedToCheckout();
      await CheckoutInformationPage.submitShippingInfo(shipping);

      expect(
        (await CheckoutOverviewPage.getLines()).map(({ name, quantity }) => ({ name, quantity })),
      ).toEqual([...cart].map(([product, quantity]) => ({ name: product.name, quantity })));
      expect(await CheckoutOverviewPage.getTotals()).toEqual(calculateOrderTotals(cartLines()));
      await expect(CheckoutOverviewPage.shippingInfo).toHaveText(
        `${shipping.firstName} ${shipping.lastName} — ${shipping.postalCode}`,
      );

      await CheckoutOverviewPage.finish();
      await expect(CheckoutCompletePage.title).toHaveText(MESSAGES.complete.title);
      await expect(CheckoutCompletePage.message).toHaveText(MESSAGES.complete.message);
    });
  });
});
