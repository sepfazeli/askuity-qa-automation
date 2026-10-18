import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/support/env';
import { log } from '../src/support/logger';

export type Suite = 'desktop' | 'mobile' | 'browserstack';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS_DIR = path.join(ROOT, 'reports');

const slug = (text: string): string =>
  text
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 120);

// The first page load can be slow while the hosted app wakes up.
export async function sharedBefore(_capabilities: unknown, specs: string[]): Promise<void> {
  log.info(`Spec: ${specs.map((spec) => path.basename(spec)).join(', ')}`);
  await browser.setTimeout({ pageLoad: 60_000 });
}

// Each suite gets its own report and screenshot folders, cleared at the start of its run.
export function sharedConfig(suite: Suite): Omit<WebdriverIO.Config, 'capabilities'> {
  const allureResultsDir = path.join(REPORTS_DIR, 'allure-results', suite);
  const screenshotsDir = path.join(REPORTS_DIR, 'screenshots', suite);
  const logsDir = path.join(REPORTS_DIR, 'logs', suite);
  // Read by src/support/logger.ts in every worker process.
  process.env.LOG_DIR = logsDir;

  return {
    runner: 'local',
    tsConfigPath: path.join(ROOT, 'tsconfig.json'),
    baseUrl: env.baseUrl,

    maxInstances: env.maxInstances,

    logLevel: 'warn',
    outputDir: logsDir,

    bail: 0,
    waitforTimeout: 10_000,
    waitforInterval: 100,
    connectionRetryTimeout: 120_000,
    connectionRetryCount: 3,

    framework: 'mocha',
    mochaOpts: {
      ui: 'bdd',
      timeout: 120_000,
      retries: env.retries,
    },

    reporters: [
      ['spec', { showPreface: false }],
      [
        'allure',
        {
          outputDir: allureResultsDir,
          disableWebdriverStepsReporting: true,
          disableWebdriverScreenshotsReporting: false,
          addConsoleLogs: true,
          reportedEnvironmentVars: { BASE_URL: env.baseUrl, BROWSER: env.browser, SUITE: suite },
        },
      ],
    ],

    onPrepare() {
      for (const dir of [allureResultsDir, screenshotsDir]) fs.rmSync(dir, { recursive: true, force: true });
      if (fs.existsSync(logsDir)) {
        for (const file of fs.readdirSync(logsDir).filter((f) => f.startsWith('worker-'))) {
          fs.rmSync(path.join(logsDir, file));
        }
      }
      console.log(
        `\n▶ ${suite} suite | ${env.baseUrl} | browser=${env.browser} headless=${env.headless} ` +
          `workers=${env.maxInstances}\n`,
      );
    },

    before: sharedBefore,

    // Save a screenshot for every failed test.
    async afterTest(test, _context, { passed, error }) {
      if (passed) return;
      log.error(`FAILED: ${test.parent} > ${test.title}\n${(error as Error | undefined)?.message ?? ''}`);
      try {
        const browserName = String(browser.capabilities.browserName ?? 'browser');
        const width = await browser.execute(() => window.innerWidth);
        fs.mkdirSync(screenshotsDir, { recursive: true });
        const file = path.join(
          screenshotsDir,
          `${slug(`${test.parent}-${test.title}`)}-${browserName}-${width}px.png`,
        );
        await browser.saveScreenshot(file);
      } catch (error) {
        console.warn(`Could not capture failure screenshot: ${(error as Error).message}`);
      }
    },
  };
}
