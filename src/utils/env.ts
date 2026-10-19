import dotenv from 'dotenv';

dotenv.config({ quiet: true });

type BrowserName = 'chrome' | 'firefox';

function readBoolean(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  return ['1', 'true', 'yes'].includes(raw.toLowerCase());
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Environment variable ${name} must be a number, received "${raw}"`);
  }
  return value;
}

function readBrowser(): BrowserName {
  const raw = (process.env.BROWSER ?? 'chrome').toLowerCase();
  if (raw === 'chrome' || raw === 'firefox') return raw;
  throw new Error(`Unsupported BROWSER "${raw}". Use chrome or firefox.`);
}

const isCI = readBoolean('CI', false);

export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://qa-task--oyettijon.replit.app',
  browser: readBrowser(),
  headless: readBoolean('HEADLESS', isCI),
  maxInstances: readNumber('MAX_INSTANCES', isCI ? 2 : 4),
  retries: readNumber('MOCHA_RETRIES', 0),
  logLevel: (process.env.LOG_LEVEL ?? 'info') as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent',
  storePassword: process.env.STORE_PASSWORD ?? 'test_sauce',
  browserstackUser: process.env.BROWSERSTACK_USERNAME ?? '',
  browserstackKey: process.env.BROWSERSTACK_ACCESS_KEY ?? '',
  isCI,
};
