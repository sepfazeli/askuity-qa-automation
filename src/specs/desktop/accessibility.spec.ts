import { expect } from '@wdio/globals';
import { productByName } from '../../data/products';
import { buildShippingInfo } from '../../data/shipping';
import { USERS } from '../../data/users';
import { loginAs, openCartWith } from '../../flows/shopping.flow';
import {
  CartPage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
  LoginPage,
} from '../../pages';
import { accessibilityViolations } from '../../utils/accessibility';

const MUG = productByName('Daybreak Ceramic Mug');

// How to reach each page from a fresh session.
const PAGES: { name: string; open: () => Promise<unknown> }[] = [
  { name: 'login', open: () => LoginPage.open() },
  { name: 'products', open: () => loginAs(USERS.standard) },
  {
    name: 'product detail',
    open: async () => {
      await loginAs(USERS.standard);
      await InventoryPage.openProduct(MUG);
    },
  },
  {
    name: 'cart',
    open: async () => {
      await loginAs(USERS.standard);
      await openCartWith(MUG);
    },
  },
  {
    name: 'checkout form',
    open: async () => {
      await loginAs(USERS.standard);
      await openCartWith(MUG);
      await CartPage.proceedToCheckout();
    },
  },
  {
    name: 'order summary',
    open: async () => {
      await loginAs(USERS.standard);
      await openCartWith(MUG);
      await CartPage.proceedToCheckout();
      await CheckoutInformationPage.submitShippingInfo(buildShippingInfo());
    },
  },
  {
    name: 'order confirmation',
    open: async () => {
      await loginAs(USERS.standard);
      await openCartWith(MUG);
      await CartPage.proceedToCheckout();
      await CheckoutInformationPage.submitShippingInfo(buildShippingInfo());
      await CheckoutOverviewPage.finish();
    },
  },
];

describe('Accessibility (WCAG 2.1 AA)', () => {
  // axe's injected script slows down every later command in the same browser session (10ms checks
  // become ~600ms), so each scan gets a fresh session afterwards.
  afterEach(async () => {
    await browser.reloadSession();
  });

  for (const page of PAGES) {
    it(`@known-bug BUG-010 TC-A11Y-01 the ${page.name} page has no accessibility violations`, async () => {
      await page.open();

      expect(await accessibilityViolations()).toEqual([]);
    });
  }
});
