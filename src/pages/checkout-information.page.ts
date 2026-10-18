import type { ShippingInfo } from '../data/shipping';
import { log } from '../support/logger';
import { parseMoney } from '../support/money';
import { PAGE_ROOT, testId } from '../support/selectors';
import { BasePage } from './base.page';
import CheckoutOverviewPage from './checkout-overview.page';

type Field = keyof ShippingInfo;

const FIELD_ID: Record<Field, { input: string; error: string }> = {
  firstName: { input: 'checkout-first-name', error: 'first-name-error' },
  lastName: { input: 'checkout-last-name', error: 'last-name-error' },
  postalCode: { input: 'checkout-postal-code', error: 'postal-code-error' },
};

class CheckoutInformationPage extends BasePage {
  protected readonly root = PAGE_ROOT.checkoutInformation;

  get title() {
    return $(testId('checkout-title'));
  }

  get continueButton() {
    return $(testId('continue-to-summary'));
  }

  get previewTotal() {
    return $(testId('preview-total'));
  }

  input(field: Field) {
    return $(testId(FIELD_ID[field].input));
  }

  fieldError(field: Field) {
    return $(testId(FIELD_ID[field].error));
  }

  // Only fills the fields given, so a test can leave some blank.
  async fill(info: Partial<ShippingInfo>): Promise<void> {
    for (const [field, value] of Object.entries(info) as [Field, string][]) {
      await this.input(field).setValue(value);
    }
  }

  async continue(): Promise<void> {
    await this.closeKeyboard();
    await this.continueButton.click();
  }

  async submitShippingInfo(info: ShippingInfo): Promise<typeof CheckoutOverviewPage> {
    log.info(`Submitting shipping info for ${info.firstName} ${info.lastName} (${info.postalCode})`);
    await this.fill(info);
    await this.continue();
    return CheckoutOverviewPage.waitForLoaded();
  }

  async getFieldValues(): Promise<ShippingInfo> {
    return {
      firstName: await this.input('firstName').getValue(),
      lastName: await this.input('lastName').getValue(),
      postalCode: await this.input('postalCode').getValue(),
    };
  }

  async getPreviewTotal(): Promise<number> {
    return parseMoney(await this.previewTotal.getText());
  }
}

export default new CheckoutInformationPage();
