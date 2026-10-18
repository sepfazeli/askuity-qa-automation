export const TAX_RATE_PERCENT = 8;

export interface SortOption {
  value: 'name-az' | 'name-za' | 'price-low' | 'price-high';
  label: string;
  by: 'name' | 'price';
  direction: 'asc' | 'desc';
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'name-az', label: 'Name: A to Z', by: 'name', direction: 'asc' },
  { value: 'name-za', label: 'Name: Z to A', by: 'name', direction: 'desc' },
  { value: 'price-low', label: 'Price: Low to High', by: 'price', direction: 'asc' },
  { value: 'price-high', label: 'Price: High to Low', by: 'price', direction: 'desc' },
];

export const DEFAULT_SORT = SORT_OPTIONS[0];

export const ALL_CATEGORIES_OPTION = { value: 'all', label: 'All categories' };

export const MESSAGES = {
  login: {
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    invalidCredentials: 'Username and password do not match any user in this service',
    lockedOut: 'Sorry, this user has been locked out.',
  },
  cart: {
    emptyTitle: 'Your cart is empty',
    emptyMessage: 'Head back to the store and add some items.',
  },
  checkout: {
    firstNameRequired: 'First Name is required',
    lastNameRequired: 'Last Name is required',
    postalCodeRequired: 'Postal Code is required',
  },
  complete: {
    title: 'Order Placed!',
    message: 'Thank you for your purchase. Your order has been successfully submitted.',
  },
  inventory: {
    emptyState: 'Nothing on this shelf matches.',
  },
};

// The app blocks an item after this many add/+ clicks (BUG-007).
export const ITEM_INTERACTION_LIMIT = 6;
