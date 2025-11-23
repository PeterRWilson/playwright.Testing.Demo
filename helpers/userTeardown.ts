import { Page } from "@playwright/test";
import * as mainPage from "./pages/main";
import * as pendingApplicationPage from "../helpers/pages/pending-applications";

const teardown = async (page: Page): Promise<void> => {
  await page.goto("https://quotes.test.uinsure.co.uk/new-quote");
  await page.locator(mainPage.buildingContentsBtn).waitFor({ state: "visible" });
  await page.getByTestId("nav-drawer-item-pending-applications").click();
  await page.locator('[alt="Loading House"]').waitFor({ state: "hidden" });
  await page.waitForTimeout(5000);
  if (await page.locator(pendingApplicationPage.quoteTable).isVisible()) {
    while (await page.locator(pendingApplicationPage.showMoreBtn).isVisible()) {
      await page.locator(pendingApplicationPage.showMoreBtn).click();
      await page.waitForTimeout(500);
    }
    let btnCount = await page.locator(pendingApplicationPage.viewApplicationBtn).count();
    while (btnCount > 0) {
      await page.locator(pendingApplicationPage.viewApplicationBtn).first().waitFor({ state: "visible" });
      await page.locator(pendingApplicationPage.viewApplicationBtn).first().click({ force: true });
      try {
        await page.locator(pendingApplicationPage.deleteApplicationBtn).click({
          force: true,
          timeout: 5000
        });
      } catch (error) {
        console.error("Error deleting pending application");
        if (!page.isClosed()) {
          await page.close();
        }
        return;
      }
      await page.locator(pendingApplicationPage.yesDeleteBtn).click({ force: true });
      await page.waitForTimeout(1000);
      btnCount = await page.locator(pendingApplicationPage.viewApplicationBtn).count();
    }
  }
};

export default teardown;
