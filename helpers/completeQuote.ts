import { expect, Page } from "@playwright/test";
import * as mainPage from "./pages/main";
import * as applicantPage from "./pages/applicant";
import * as addressPage from "./pages/riskAddress";
import * as propertyPage from "./pages/property";
import * as quotePage from "./pages/quote";
import * as eligibilityPage from "./pages/eligibility";
import * as quoteSummary from "./pages/quote-summary";
import * as applicationPage from "./pages/application";

const userDetail = {
  userEmail: "test@user.com",
  userNumber: "0000000000"
};
/**
 *
 * @param page
 */
const bedQuote_4_complete = async (page: Page): Promise<void> => {
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
  const options1 = page.locator("[role='option']");
  const count1 = await options1.count();
  for (let index = 0; index < count1; index++) {
    const value = await options1.nth(index).getAttribute("data-value");
    if (value === "4") {
      await options1.nth(index).click();
      break;
    }
  }
  await page.locator(propertyPage.getQuotesBtn).click();
  await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
  await expect(page.url()).toContain("quote");
  await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
  await page
    .locator(quotePage.emergencyHomeCoverCB)
    .filter({ has: page.locator(":visible") })
    .click();
  await page
    .locator(quotePage.legalProtectionCB)
    .filter({ has: page.locator(":visible") })
    .click();
  await page
    .locator(quotePage.refreshQuotesBtn)
    .filter({ has: page.locator(":visible") })
    .waitFor({ state: "attached" });
  await page
    .locator(quotePage.refreshQuotesBtn)
    .filter({ has: page.locator(":visible") })
    .click();
  await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
  await page.locator(quotePage.monthlyPrice).first().waitFor({ state: "visible" });
  await page.locator(quotePage.applyBtn).nth(0).click();
  await page.locator(eligibilityPage.nextBtn).waitFor({ state: "visible" });
  await expect(page.locator(eligibilityPage.nextBtn)).toBeDisabled();
  await expect(page.url()).toContain("eligibility");
  const allBtn = await page.locator(eligibilityPage.acceptBtn).count();
  for (let index = 0; index < allBtn; index++) {
    await page.locator(eligibilityPage.acceptBtn).nth(index).click();
  }
  await expect(page.locator(eligibilityPage.nextBtn)).toBeEnabled();
  await page.locator(eligibilityPage.nextBtn).click();
  await page.locator(quoteSummary.backBtn).waitFor({ state: "visible" });
  await expect(page.url()).toContain("quote-summary");
  await page.locator(quoteSummary.nextBtn).click();
  await page.locator(applicationPage.startDateBtn).waitFor({ state: "visible" });
  await expect(page.url()).toContain("application");
  await page.locator(applicationPage.noDateBtn).click();
  await page.locator(applicationPage.paymentDetailNoBtn).click();
  await page.locator(applicationPage.emailField).fill(userDetail.userEmail);
  await page.locator(applicationPage.numberField).fill(userDetail.userNumber);
  await page.locator(applicationPage.clientVulnerabilitiesNoBtn).click();
  await page.locator(applicationPage.nextBtn).click();
};
export default bedQuote_4_complete;
