import { PURCHASABLE_PRODUCTS, productByName, type Product } from '../data/products';
import type { User } from '../data/users';
import { CartPage, InventoryPage, LoginPage } from '../pages';
import { log } from '../utils/logger';
import type { OrderLine } from '../utils/money';
import { waitUntilEqual } from '../utils/wait';

export interface CartRequest {
  product: Product;
  quantity: number;
}

type CartRequestInput = Product | CartRequest;

const toRequest = (input: CartRequestInput): CartRequest =>
  'product' in input ? input : { product: input, quantity: 1 };

export async function loginAs(user: User): Promise<void> {
  await LoginPage.open();
  await LoginPage.loginAs(user);
}

// Each add is confirmed by the cart badge going up, which also waits out the "Added!" animation.
export async function addToCart(...items: CartRequestInput[]): Promise<void> {
  for (const { product, quantity } of items.map(toRequest)) {
    log.info(`Adding ${quantity} x "${product.name}" to the cart`);
    const card = InventoryPage.card(product);
    await card.setQuantity(quantity);
    const before = await InventoryPage.header.getCartBadgeCount();
    await card.addToCart();
    await waitUntilEqual(
      () => InventoryPage.header.getCartBadgeCount(),
      before + quantity,
      `the cart badge after adding ${quantity} x "${product.name}"`,
    );
  }
}

export async function openCartWith(...items: CartRequestInput[]): Promise<typeof CartPage> {
  await addToCart(...items);
  await InventoryPage.header.openCart();
  return CartPage.waitForLoaded();
}

// Expected order lines, using the catalogue prices.
export function expectedOrderLines(...items: CartRequestInput[]): OrderLine[] {
  return items.map(toRequest).map(({ product, quantity }) => ({ unitPrice: product.price, quantity }));
}

export const totalQuantity = (...items: CartRequestInput[]): number =>
  items.map(toRequest).reduce((sum, { quantity }) => sum + quantity, 0);

// First and last products in the current order, skipping Bolt T-Shirt (BUG-002).
export async function productsFromBothEnds(countPerEnd = 1): Promise<Product[]> {
  const purchasable = (await InventoryPage.getProductNames())
    .map(productByName)
    .filter((product) => PURCHASABLE_PRODUCTS.includes(product));
  if (purchasable.length < countPerEnd * 2) {
    throw new Error(`Need ${countPerEnd * 2} purchasable products, only ${purchasable.length} displayed`);
  }
  return [...purchasable.slice(0, countPerEnd), ...purchasable.slice(-countPerEnd)];
}
