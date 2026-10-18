export async function viewportWidth(): Promise<number> {
  return browser.execute(() => window.innerWidth);
}

export async function hasHorizontalOverflow(): Promise<boolean> {
  return browser.execute(() => document.documentElement.scrollWidth > window.innerWidth);
}

// Counts columns by grouping the elements by their left edge.
export async function columnCount(selector: string): Promise<number> {
  const lefts = await browser.execute(
    (sel: string) =>
      Array.from(document.querySelectorAll(sel)).map((el) => Math.round(el.getBoundingClientRect().left)),
    selector,
  );
  return new Set(lefts).size;
}

export async function isHorizontallyInViewport(element: WebdriverIO.Element): Promise<boolean> {
  return browser.execute(
    (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      return rect.left >= 0 && rect.right <= window.innerWidth;
    },
    element as unknown as HTMLElement,
  );
}
