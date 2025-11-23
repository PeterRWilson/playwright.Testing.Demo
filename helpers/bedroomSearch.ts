import { expect, Page } from "@playwright/test";
import * as mainPage from "../helpers/pages/main";
import * as applicantPage from "../helpers/pages/applicant";
import * as addressPage from "../helpers/pages/riskAddress";
import * as propertyPage from "../helpers/pages/property";
import * as quotePage from "../helpers/pages/quote";

/**
 *
 * @param page
 */
const bedSearch_6 = async (page: Page): Promise<void> => {
  await page.goto("https://quotes.test.uinsure.co.uk/new-quote");
  await page.locator(mainPage.buildingContentsBtn).click();
  await page.locator(applicantPage.startQuoteBtn).waitFor({ state: "visible" });
  await expect(page.url()).toContain("applicant");
  await expect(page.locator(applicantPage.startQuoteBtn)).toBeDisabled();
  const firstName = "UserFirst";
  const lastName = "UserLast";
  const dob = "09091990";
  await page.getByRole("radio", { name: "Mr", exact: true }).click();
  await page.locator(applicantPage.firstNameField).fill(firstName);
  await page.locator(applicantPage.lastNameField).fill(lastName);
  await page.locator(applicantPage.dobField).fill(dob);
  await expect(page.locator(applicantPage.startQuoteBtn)).toBeEnabled();
  await page.locator(applicantPage.startQuoteBtn).click();
  await expect(page.url()).toContain("details");
  await page.locator(addressPage.finderFields).pressSequentially("BD5 9LJ", { delay: 200 });
  await page.getByRole("option", { name: "45 Dawnay Road, Bradford, BD5 9LJ" }).click();
  await page.locator(propertyPage.getQuotesBtn).waitFor({ state: "visible" });
  await page.locator(propertyPage.numberOfBedFields).click();
  await page.locator(propertyPage.numberOfBedDd).waitFor({ state: "attached" });
  const options = page.locator("[role='option']");
  const count = await options.count();
  for (let index = 0; index < count; index++) {
    const value = await options.nth(index).getAttribute("data-value");
    if (value === "6") {
      await options.nth(index).click();
      break;
    }
  }
  await page.locator(propertyPage.getQuotesBtn).click();
  await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
  await expect(page.url()).toContain("quote");
};
export default bedSearch_6;
