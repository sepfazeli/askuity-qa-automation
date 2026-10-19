import { expect } from '@wdio/globals';
import { MESSAGES } from '../../data/constants';
import { productByName } from '../../data/products';
import { buildShippingInfo, type ShippingInfo } from '../../data/shipping';
import { USERS } from '../../data/users';
import {
  expectedOrderLines,
  loginAs,
  openCartWith,
  totalQuantity,
  type CartRequest,
} from '../../flows/shopping.flow';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
} from '../../pages';
import { calculateOrderTotals, lineTotal } from '../../utils/money';

const ITEMS: CartRequest[] = [
  { product: productByName('After Hours Hoodie'), quantity: 2 },
  { product: productByName('Trailmark Day Pack'), quantity: 1 },
];
const EXPECTED_TOTALS = calculateOrderTotals(expectedOrderLines(...ITEMS));

const REQUIRED_FIELDS: { field: keyof ShippingInfo; label: string; message: string; bug?: string }[] = [
  { field: 'firstName', label: 'first name', message: MESSAGES.checkout.firstNameRequired, bug: 'BUG-003' },
  { field: 'lastName', label: 'last name', message: MESSAGES.checkout.lastNameRequired },
  { field: 'postalCode', label: 'postal code', message: MESSAGES.checkout.postalCodeRequired },
];

describe('Checkout', () => {
  beforeEach(async () => {
    await loginAs(USERS.standard);
    await openCartWith(...ITEMS);
    await CartPage.proceedToCheckout();
  });

  it('TC-CHK-01 shows the shipping form with an order preview total', async () => {
    await expect(CheckoutInformationPage.title).toHaveText('Checkout');
    for (const { field } of REQUIRED_FIELDS) {
      await expect(CheckoutInformationPage.input(field)).toBeDisplayed();
    }
    expect(await CheckoutInformationPage.getPreviewTotal()).toBe(EXPECTED_TOTALS.total);
  });

  describe('TC-CHK-02 shipping form validation', () => {
    for (const { field, label, message, bug } of REQUIRED_FIELDS) {
      it(`${bug ? `@known-bug ${bug} ` : ''}blocks a missing ${label} with "${message}"`, async () => {
        const { [field]: _omitted, ...otherFields } = buildShippingInfo();

        await CheckoutInformationPage.fill(otherFields);
        await CheckoutInformationPage.continue();

        await expect(CheckoutInformationPage.fieldError(field)).toHaveText(message);
        for (const other of REQUIRED_FIELDS.filter((f) => f.field !== field)) {
          await expect(CheckoutInformationPage.fieldError(other.field)).not.toBeExisting();
        }
        await expect(CheckoutOverviewPage.rootElement).not.toBeExisting();
      });
    }

    it('flags all three fields when the form is submitted empty', async () => {
      await CheckoutInformationPage.continue();

      for (const { field } of REQUIRED_FIELDS) {
        await expect(CheckoutInformationPage.fieldError(field)).toBeDisplayed();
      }
      await expect(CheckoutOverviewPage.rootElement).not.toBeExisting();
    });

    it('treats whitespace-only values as missing', async () => {
      await CheckoutInformationPage.fill({ firstName: '   ', lastName: '   ', postalCode: '   ' });
      await CheckoutInformationPage.continue();

      for (const { field } of REQUIRED_FIELDS) {
        await expect(CheckoutInformationPage.fieldError(field)).toBeDisplayed();
      }
    });
  });

  it('@smoke TC-CHK-03 order summary matches the cart, the totals and the shipping details', async () => {
    const shipping = buildShippingInfo();

    await CheckoutInformationPage.submitShippingInfo(shipping);

    await expect(CheckoutOverviewPage.title).toHaveText('Order Summary');
    expect(await CheckoutOverviewPage.getLines()).toEqual(
      ITEMS.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
        lineTotal: lineTotal({ unitPrice: product.price, quantity }),
      })),
    );
    expect(await CheckoutOverviewPage.getTotals()).toEqual(EXPECTED_TOTALS);
    await expect(CheckoutOverviewPage.shippingInfo).toHaveText(
      `${shipping.firstName} ${shipping.lastName} — ${shipping.postalCode}`,
    );
  });

  it('TC-CHK-04 going back from the summary keeps the entered shipping details', async () => {
    const shipping = buildShippingInfo();
    await CheckoutInformationPage.submitShippingInfo(shipping);

    await CheckoutOverviewPage.backToInformation();

    expect(await CheckoutInformationPage.getFieldValues()).toEqual(shipping);
  });

  it('@smoke TC-CHK-05 finishing shows the confirmation, and Continue Shopping starts a fresh cart', async () => {
    await CheckoutInformationPage.submitShippingInfo(buildShippingInfo());

    await CheckoutOverviewPage.finish();

    await expect(CheckoutCompletePage.title).toHaveText(MESSAGES.complete.title);
    await expect(CheckoutCompletePage.message).toHaveText(MESSAGES.complete.message);

    await CheckoutCompletePage.continueShopping();

    expect(await InventoryPage.header.getCartBadgeCount()).toBe(0);
    await InventoryPage.header.openCart();
    await expect(CartPage.emptyTitle).toBeDisplayed();
  });

  it('@known-bug BUG-008 TC-CHK-06 the cart is emptied as soon as the order is placed', async () => {
    await CheckoutInformationPage.submitShippingInfo(buildShippingInfo());
    expect(await CheckoutOverviewPage.header.getCartBadgeCount()).toBe(totalQuantity(...ITEMS));

    await CheckoutOverviewPage.finish();

    expect(await CheckoutCompletePage.header.getCartBadgeCount()).toBe(0);
  });
});
