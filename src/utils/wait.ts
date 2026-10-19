// Like browser.waitUntil, but the error says which value it saw last.
export async function waitUntilEqual<T>(
  read: () => Promise<T>,
  expected: T,
  description: string,
  timeout?: number,
): Promise<void> {
  let last: T | undefined;
  try {
    await browser.waitUntil(
      async () => {
        last = await read();
        return last === expected;
      },
      { timeout },
    );
  } catch {
    throw new Error(
      `Timed out waiting for ${description} to be ${String(expected)} (last value: ${String(last)})`,
    );
  }
}
