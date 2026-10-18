import { testId } from '../support/selectors';
import { HeaderComponent } from './components/header.component';

export abstract class BasePage {
  // An element that only exists once the page has rendered.
  protected abstract readonly root: string;

  readonly header = new HeaderComponent();

  get rootElement() {
    return $(this.root);
  }

  // Shown when an item hits the click limit (BUG-007).
  get overloadBanner() {
    return $(testId('overload-error-banner'));
  }

  // On real Android phones a tap can get lost if the on-screen keyboard closes during it (the page
  // jumps). Taking focus off the field first closes the keyboard before the tap.
  protected async closeKeyboard(): Promise<void> {
    await browser.execute(() => (document.activeElement as HTMLElement | null)?.blur());
  }

  async waitForLoaded(timeout?: number): Promise<this> {
    await this.rootElement.waitForDisplayed({
      timeout,
      timeoutMsg: `${this.constructor.name} did not load (waited for ${this.root})`,
    });
    return this;
  }

  async isLoaded(): Promise<boolean> {
    return this.rootElement.isDisplayed();
  }
}
