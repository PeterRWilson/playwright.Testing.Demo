import { Locator } from "@playwright/test";

/**
 *
 * @param locator
 * @returns
 */
export const priceConverter = async (locator: Locator): Promise<number> => {
  const texts = await locator.locator("span").allTextContents();
  const combined = texts.join("");
  const numericString = combined.replace("£", "");
  const price = parseFloat(numericString);
  return price;
};
