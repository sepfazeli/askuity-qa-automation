import { step as allureStep } from '@wdio/allure-reporter';
import { log } from './logger';

// A named step: written to the log and shown in the Allure report.
export async function step<T>(name: string, body: () => Promise<T>): Promise<T> {
  log.info(`STEP: ${name}`);
  return allureStep(name, () => body());
}
