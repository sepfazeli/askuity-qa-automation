export const testId = (id: string): string => `[data-test="${id}"]`;

export const testIdPrefix = (prefix: string): string => `[data-test^="${prefix}"]`;

export const itemId = (id: string): string => `[data-test-item-id="${id}"]`;

// Lets components wait for a page without importing the page class (avoids circular imports).
export const PAGE_ROOT = {
  login: testId('login-page'),
  inventory: testId('inventory-page'),
  productDetail: testId('product-detail-page'),
  cart: testId('cart-page'),
  checkoutInformation: testId('checkout-form'),
  checkoutOverview: testId('checkout-summary-page'),
  checkoutComplete: testId('checkout-success-page'),
};
