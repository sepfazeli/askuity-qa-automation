import { env } from '../support/env';
import { MESSAGES } from './constants';

export interface User {
  username: string;
  password: string;
  label: string;
  canLogin: boolean;
  expectedError?: string;
}

const password = env.storePassword;

export const USERS: Record<'standard' | 'locked' | 'imageVariation' | 'cartBadge', User> = {
  standard: { username: 'fern_signal', password, label: 'Shopper', canLogin: true },
  locked: {
    username: 'quiet_lock',
    password,
    label: 'Locked account',
    canLogin: false,
    expectedError: MESSAGES.login.lockedOut,
  },
  imageVariation: { username: 'lens_warp', password, label: 'Image variation', canLogin: true },
  cartBadge: { username: 'count_echo', password, label: 'Cart badge', canLogin: true },
};

export const PRACTICE_USERS: readonly User[] = Object.values(USERS);

export const INVALID_CREDENTIALS = [
  {
    scenario: 'a valid username with the wrong password',
    username: USERS.standard.username,
    password: 'not_the_password',
    expectedError: MESSAGES.login.invalidCredentials,
  },
  {
    scenario: 'an unknown username',
    username: 'ghost_user',
    password,
    expectedError: MESSAGES.login.invalidCredentials,
  },
  {
    scenario: 'a username in the wrong case',
    username: USERS.standard.username.toUpperCase(),
    password,
    expectedError: MESSAGES.login.invalidCredentials,
  },
];
