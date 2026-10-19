import path from 'node:path';
import { env } from '../src/utils/env';
import { ROOT, sharedConfig } from './wdio.shared.conf';

if (!env.browserstackUser || !env.browserstackKey) {
  throw new Error('Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY in .env to run on BrowserStack.');
}

function realDevice(browserName: string, deviceName: string, osVersion: string): WebdriverIO.Capabilities {
  return {
    browserName,
    'bstack:options': {
      deviceName,
      osVersion,
      realMobile: true,
      projectName: 'Askuity QA Automation',
      buildName: 'Morrow Supply mobile',
    },
  };
}

// Runs the same mobile tests on real phones in BrowserStack's cloud.
export const config: WebdriverIO.Config = {
  ...sharedConfig('browserstack'),
  user: env.browserstackUser,
  key: env.browserstackKey,
  specs: [path.join(ROOT, 'src/specs/mobile/**/*.spec.ts')],
  // Both devices run at the same time (the free plan allows up to 5).
  maxInstances: 2,
  capabilities: [realDevice('safari', 'iPhone 17', '26'), realDevice('chrome', 'Samsung Galaxy S25', '15.0')],
  services: [
    [
      'browserstack',
      {
        // BrowserStack's extra analytics product; not needed here.
        testReporting: false,
        buildIdentifier: '#${BUILD_NUMBER}',
      },
    ],
  ],
};
