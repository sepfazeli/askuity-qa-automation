import path from 'node:path';
import { env } from '../src/support/env';
import { ROOT, sharedBefore, sharedConfig } from './wdio.shared.conf';

const WINDOW = { width: 1440, height: 900 };

function desktopCapability(): WebdriverIO.Capabilities {
  switch (env.browser) {
    case 'firefox':
      return {
        browserName: 'firefox',
        // Otherwise WebdriverIO may download a Firefox Nightly build, which was unstable.
        browserVersion: 'stable',
        'moz:firefoxOptions': { args: env.headless ? ['-headless'] : [] },
      };
    default:
      return {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: [
            ...(env.headless ? ['--headless=new'] : []),
            `--window-size=${WINDOW.width},${WINDOW.height}`,
            '--disable-search-engine-choice-screen',
            '--disable-dev-shm-usage',
            ...(env.isCI ? ['--no-sandbox'] : []),
          ],
        },
      };
  }
}

export const config: WebdriverIO.Config = {
  ...sharedConfig('desktop'),
  specs: [path.join(ROOT, 'src/specs/desktop/**/*.spec.ts')],
  capabilities: [desktopCapability()],

  before: [
    sharedBefore,
    // Firefox ignores --window-size.
    async () => browser.setWindowSize(WINDOW.width, WINDOW.height),
  ],
};
