export type Category = 'apparel' | 'accessories' | 'gear' | 'books';

export const CATEGORIES: Category[] = ['apparel', 'accessories', 'gear', 'books'];

export interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  category: Category;
}

// Expected catalogue. Tests compare the page against this list.
export const PRODUCTS: readonly Product[] = [
  { id: 1, slug: 'backpack', name: 'Trailmark Day Pack', price: 29.99, category: 'gear' },
  { id: 2, slug: 'bike-light', name: 'Nightline Safety Light', price: 9.99, category: 'gear' },
  { id: 3, slug: 'bolt-t-shirt', name: 'Bolt T-Shirt', price: 15.99, category: 'apparel' },
  { id: 4, slug: 'fleece-jacket', name: 'Summit Fleece', price: 49.99, category: 'apparel' },
  { id: 5, slug: 'onesie', name: 'Little Trek Bodysuit', price: 7.99, category: 'apparel' },
  { id: 6, slug: 'all-the-things-t-shirt', name: 'Side Quest Tee', price: 15.99, category: 'apparel' },
  { id: 7, slug: 'sauce-labs-mug', name: 'Daybreak Ceramic Mug', price: 14.99, category: 'accessories' },
  { id: 8, slug: 'sauce-labs-hoodie', name: 'After Hours Hoodie', price: 44.99, category: 'apparel' },
  { id: 9, slug: 'lab-notebook', name: 'Gridline Journal', price: 12.99, category: 'accessories' },
  { id: 10, slug: 'qa-sticker-pack', name: 'Branch Point Decals', price: 4.99, category: 'accessories' },
  { id: 11, slug: 'automation-handbook', name: 'Signal Path Field Guide', price: 24.99, category: 'books' },
  { id: 12, slug: 'debug-socks', name: 'Bug Hunt Crew Socks', price: 8.99, category: 'accessories' },
];

export function productByName(name: string): Product {
  const product = PRODUCTS.find((p) => p.name === name);
  if (!product) throw new Error(`Product "${name}" is not in the expected catalogue`);
  return product;
}

export function productById(id: number): Product {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) throw new Error(`Product id ${id} is not in the expected catalogue`);
  return product;
}

export const productsInCategory = (category: Category): Product[] =>
  PRODUCTS.filter((p) => p.category === category);

// Bolt T-Shirt can't be added to the cart (BUG-002), so happy-path tests leave it out.
export const PURCHASABLE_PRODUCTS: readonly Product[] = PRODUCTS.filter((p) => p.slug !== 'bolt-t-shirt');
