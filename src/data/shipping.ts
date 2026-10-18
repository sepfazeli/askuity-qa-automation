import { faker } from '@faker-js/faker';

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export function buildShippingInfo(overrides: Partial<ShippingInfo> = {}): ShippingInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.helpers.replaceSymbols('?#? #?#').toUpperCase(),
    ...overrides,
  };
}
