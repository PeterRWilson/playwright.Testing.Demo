import { test, expect } from "@playwright/test";
import * as loginPage from "../helpers/pages/login";
import * as mainPage from "../helpers/pages/main";
import * as applicantPage from "../helpers/pages/applicant";
import * as addressPage from "../helpers/pages/riskAddress";
import * as propertyPage from "../helpers/pages/property";
import * as quotePage from "../helpers/pages/quote";
import * as eligibilityPage from "../helpers/pages/eligibility";
import { priceConverter } from "../helpers/priceConverter";
import * as quoteSummary from "../helpers/pages/quote-summary";
import * as applicationPage from "../helpers/pages/application";
import * as applicationPendingPage from "../helpers/pages/application-pending";
import * as paymentPage from "../helpers/pages/payment";
import * as applicationCompletePage from "../helpers/pages/application-completed";
import bedSearch_6 from "../helpers/bedroomSearch";
import bedQuote_4_withHE from "../helpers/updatedQuoteSearch";
import bedQuote_4_complete from "../helpers/completeQuote";
import userLogin from "../helpers/userLogin";
import teardown from "../helpers/userTeardown";

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  if (await page.locator(loginPage.signInBtn).isVisible()) {
    await userLogin(page, "Add username or email", "Add password");
  }
});
test.use({ storageState: "userCookie.json" });

const userDetail = {
  firstName: "UserFirst",
  lastName: "UserLast",
  dob: "09091990",
  address: "45 Dawnay Road",
  postcode: "BD5 9LJ",
  userEmail: "test@user.com",
  userNumber: "0000000000",
  accountName: "Test Test",
  accountNumber: "55779911",
  accountSortCode: "200000"
};
test.describe("A broker can submit a buildings and contents policy that includes ancillaries", () => {
  test("User can start a new Buildings & Contents quote", async ({ page }) => {
    await page.goto("https://quotes.test.uinsure.co.uk/new-quote");
    await page.locator(mainPage.buildingContentsBtn).click();
    await page.locator(applicantPage.startQuoteBtn).waitFor({ state: "visible" });
    await expect(page.url()).toContain("applicant");
    await expect(page.locator(applicantPage.startQuoteBtn)).toBeDisabled();
    await page.getByRole("radio", { name: "Mr", exact: true }).click();
    await page.locator(applicantPage.firstNameField).fill(userDetail.firstName);
    await page.locator(applicantPage.lastNameField).fill(userDetail.lastName);
    await page.locator(applicantPage.dobField).fill("09091800");
    await page.locator(applicantPage.dobField).blur();
    const overAge = await page.locator(applicantPage.dobTextHelper).textContent();
    await expect(overAge).toMatch("Applicant is too old");
    await expect(page.locator(applicantPage.startQuoteBtn)).toBeDisabled();
    await page.locator(applicantPage.dobField).fill("09092010");
    await page.locator(applicantPage.dobField).blur();
    const underAge = await page.locator(applicantPage.dobTextHelper).textContent();
    await expect(underAge).toMatch("Must be at least the age of 18");
    await expect(page.locator(applicantPage.startQuoteBtn)).toBeDisabled();
    await page.locator(applicantPage.dobField).fill(userDetail.dob);
    await page.locator(applicantPage.dobField).blur();
    await expect(page.locator(applicantPage.startQuoteBtn)).toBeEnabled();
    await page.locator(applicantPage.startQuoteBtn).click();
    await expect(page.url()).toContain("details");
    await page.locator(addressPage.finderFields).pressSequentially(userDetail.postcode, { delay: 200 });
    await page.getByRole("option", { name: "45 Dawnay Road, Bradford, BD5 9LJ" }).click();
    await page.locator(propertyPage.getQuotesBtn).waitFor({ state: "visible" });
    await expect(page.url()).toContain("property");
    const address = await page.locator(propertyPage.lineAddress1).textContent();
    const trimmedAddress = address?.trim().replace(/,$/, "");
    const postcode = await page.locator(propertyPage.addressPostcode).textContent();
    await expect(trimmedAddress).toMatch(userDetail.address);
    await expect(postcode).toMatch(userDetail.postcode);
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
  });
  test("User can add ancillaries and price increases", async ({ page }) => {
    await bedSearch_6(page);
    await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
    const noQuote = await page.locator(quotePage.noQuoteMessage).first().textContent();
    await expect(noQuote).toMatch("The insurer is unable to provide a quote for the details entered");
    await expect(page.locator(quotePage.downloadQuoteBtn)).toBeDisabled();
    await page.locator(quotePage.editDetailsBtn).click();
    await page.locator(quotePage.editDetailsPu).waitFor({ state: "attached" });
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
    await page.locator(quotePage.PuSaveDetailsBtn).click();
    await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
    await page
      .locator(quotePage.refreshQuotesBtn)
      .filter({ has: page.locator(":visible") })
      .click();
    await page.locator(quotePage.resultsContainer).waitFor({ state: "attached" });
    await page.locator(quotePage.applyBtn).first().waitFor({ state: "visible" });
    const originalMonthlyPrice = await priceConverter(page.locator(quotePage.monthlyPrice).first());
    const originalYearlyPrice = await priceConverter(page.locator(quotePage.yearlyPrice).first());
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
    await page.locator(quotePage.applyBtn).first().waitFor({ state: "visible" });
    await page.waitForTimeout(500);
    const updatedMonthlyPrice = await priceConverter(page.locator(quotePage.monthlyPrice).first());
    const updatedYearlyPrice = await priceConverter(page.locator(quotePage.yearlyPrice).first());
    await expect(originalMonthlyPrice).toBeLessThan(updatedMonthlyPrice);
    await expect(originalYearlyPrice).toBeLessThan(updatedYearlyPrice);
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
    const applicant = await page.locator(quoteSummary.userNameField).textContent();
    await expect(applicant).toContain(userDetail.firstName + " " + userDetail.lastName);
    await page.locator(quoteSummary.monthlyPrice).first().waitFor({ state: "visible" });
    const quoteMonthlyPrice = await priceConverter(page.locator(quoteSummary.monthlyPrice).first());
    const quoteYearlyPrice = await priceConverter(page.locator(quoteSummary.yearlyPrice).first());
    await expect(updatedMonthlyPrice).toEqual(quoteMonthlyPrice);
    await expect(updatedYearlyPrice).toEqual(quoteYearlyPrice);
    await expect(page.getByText("Home emergencyIncluded")).toBeVisible();
    await expect(page.getByText("Legal ProtectionIncluded")).toBeVisible();
    await page.locator(quoteSummary.nextBtn).click();
  });
  test("Submit Application & Validate API", async ({ page }) => {
    await bedQuote_4_withHE(page);
    await page.locator(applicationPage.startDateBtn).waitFor({ state: "visible" });
    await expect(page.url()).toContain("application");
    await page.locator(applicationPage.noDateBtn).click();
    await page.locator(applicationPage.paymentDetailNoBtn).click();
    const userNumberShort = "000000000";
    const userNumberLong = "000000000000";
    await page.locator(applicationPage.emailField).fill(userDetail.userNumber);
    await page.locator(applicationPage.emailField).blur();
    const errorMessage = await page.locator(applicationPage.invalidEmailMessage).textContent();
    await expect(errorMessage).toMatch("Client's email address is invalid");
    await page.locator(applicationPage.emailField).fill(userDetail.userEmail);
    await page.locator(applicationPage.numberField).fill(userNumberShort);
    await page.locator(applicationPage.numberField).blur();
    const shortErrormessage = await page.locator(applicationPage.invalidNumberMessage).textContent();
    await expect(shortErrormessage).toMatch("Client's telephone number is invalid");
    await page.locator(applicationPage.numberField).fill(userNumberLong);
    await page.locator(applicationPage.numberField).blur();
    const longErrormessage = await page.locator(applicationPage.invalidNumberMessage).textContent();
    await expect(longErrormessage).toMatch("Client's telephone number is invalid");
    await page.locator(applicationPage.numberField).fill(userDetail.userNumber);
    await page.locator(applicationPage.clientVulnerabilitiesNoBtn).click();
    const [appForm] = await Promise.all([
      page.waitForRequest("**/api/apply"),
      page.locator(applicationPage.nextBtn).click()
    ]);
    const APIuserCred = appForm.postDataJSON();
    await expect(APIuserCred.Apply.Client1EmailAddress).toBe(userDetail.userEmail);
    await expect(APIuserCred.Apply.Client1TelephoneNumber).toBe(userDetail.userNumber);
  });
  test("Confirm Ancillaries on Completion Screen", async ({ page }) => {
    await bedQuote_4_complete(page);
    await page.locator(applicationPendingPage.completeAppBtn).waitFor({ state: "visible" });
    await expect(page.url()).toContain("application-pending");
    await page.locator(applicationPendingPage.completeAppBtn).click();
    await page.locator(applicationPage.backBtn).waitFor({ state: "visible" });
    await expect(page.url()).toContain("application");
    await page.locator(applicationPage.nextBtn).click();
    await page.locator(paymentPage.accountNameField).waitFor({ state: "visible" });
    await expect(page.url()).toContain("payment");
    await page.getByLabel("One single payment").click();
    await page.locator(paymentPage.accountNameField).fill(userDetail.accountName);
    await page.locator(paymentPage.accountNumberField).fill(userDetail.accountNumber);
    await page.locator(paymentPage.accountSortCodeField).fill(userDetail.accountSortCode);
    await page.locator(paymentPage.confirmInsurance).click();
    await page.locator(paymentPage.confirmPolicy).click();
    await page.locator(paymentPage.confirmCover).click();
    const [paymentForm] = await Promise.all([
      page.waitForRequest("**/api/apply"),
      page.locator(paymentPage.makePaymentBtn).click()
    ]);
    userDetail;
    const APIpaymentDetails = paymentForm.postDataJSON();
    await expect(APIpaymentDetails.Apply.Bank.AccountName).toBe(userDetail.accountName);
    await expect(APIpaymentDetails.Apply.Bank.AccountNumber).toBe(userDetail.accountNumber);
    await expect(APIpaymentDetails.Apply.Bank.SortCode).toBe(userDetail.accountSortCode);
    await expect(APIpaymentDetails.Apply.Client1EmailAddress).toBe(userDetail.userEmail);
    await expect(APIpaymentDetails.Apply.Client1TelephoneNumber.replace(/^\+44/, "0")).toBe(userDetail.userNumber);
    await expect(APIpaymentDetails.Apply.CorrepsondenceAddress.AddressLine1).toBe(userDetail.address);
    await expect(APIpaymentDetails.Apply.CorrepsondenceAddress.Postcode).toBe(userDetail.postcode);
    await page.locator(applicationCompletePage.returnHomeBtn).waitFor({ state: "visible" });
    await expect(page.url()).toContain("application-completed");
  });
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await teardown(page);
    await context.close();
  });
});
