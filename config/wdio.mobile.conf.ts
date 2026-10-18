import path from 'node:path';
import { env } from '../src/support/env';
import { DEVICES, type DeviceProfile } from './devices';
import { ROOT, sharedConfig } from './wdio.shared.conf';

function mobileCapability(device: DeviceProfile): WebdriverIO.Capabilities {
  return {
    browserName: 'chrome',
    'goog:chromeOptions': {
      args: [
        ...(env.headless ? ['--headless=new'] : []),
        '--disable-search-engine-choice-screen',
        '--disable-dev-shm-usage',
        ...(env.isCI ? ['--no-sandbox'] : []),
      ],
      mobileEmulation: {
        deviceMetrics: {
          width: device.width,
          height: device.height,
          pixelRatio: device.pixelRatio,
          touch: true,
        },
        userAgent: device.userAgent,
      },
    },
  };
}

export const config: WebdriverIO.Config = {
  ...sharedConfig('mobile'),
  specs: [path.join(ROOT, 'src/specs/mobile/**/*.spec.ts')],
  // One capability per device, run in parallel.
  capabilities: DEVICES.map(mobileCapability),
};
