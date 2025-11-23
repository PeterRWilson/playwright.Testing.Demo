import { expect, Page } from "@playwright/test";
import * as loginPage from "../helpers/pages/login";
import * as universalLocators from "../helpers/pages/universal";
import * as mainPage from "../helpers/pages/main";

/**
 *
 * @param page
 * @param username
 * @param password
 */
const userLogin = async (page: Page, username?: string, password?: string): Promise<void> => {
  await page.goto("https://quotes.test.uinsure.co.uk");
  await expect(page).toHaveTitle("Uinsure");
  if (await page.locator(loginPage.signInBtn).isVisible()) {
    await page.locator(loginPage.signInBtn).waitFor({ state: "attached" });
    await expect(page.locator(loginPage.signInBtn)).toBeDisabled();
    await page.locator(loginPage.usernameField).fill(username!);
    await page.locator(loginPage.passwordField).fill(password!);
    await expect(page.locator(loginPage.signInBtn)).toBeEnabled();
    const [loginForm] = await Promise.all([
      page.waitForRequest("**/api/authenticate"),
      page.locator(loginPage.signInBtn).click()
    ]);
    const APIlogin = loginForm.postDataJSON();
    await expect(APIlogin.username).toBe(username);
    await expect(APIlogin.password).toBe(password);
    await page.locator(mainPage.buildingContentsBtn).waitFor({ state: "visible" });
    if (await page.locator(universalLocators.cookiesAcceptBtn).isVisible({ timeout: 3000 })) {
      await page.locator(universalLocators.cookiesAcceptBtn).click();
    }
    await page.context().storageState({ path: "userCookie.json" });
  }
};
export default userLogin;
