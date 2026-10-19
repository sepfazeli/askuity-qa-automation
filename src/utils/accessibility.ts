import AxeBuilder from '@axe-core/webdriverio';
import { log } from './logger';

const WCAG_21_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

// Scans the current page with axe and returns one readable line per broken rule, so a failing
// test lists exactly what is wrong (e.g. "link-name (serious, 12 elements): Links must have discernible text").
export async function accessibilityViolations(): Promise<string[]> {
  const results = await new AxeBuilder({ client: browser }).withTags(WCAG_21_AA).analyze();
  const violations = results.violations.map(
    (v) => `${v.id} (${v.impact}, ${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}): ${v.help}`,
  );
  log.info(`Accessibility scan of ${await browser.getUrl()}: ${violations.length} rule(s) broken`);
  return violations;
}
