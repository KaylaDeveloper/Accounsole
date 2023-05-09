/* eslint-disable testing-library/prefer-screen-queries */
import { expect } from "./fixtures";
import fixtures from "./fixtures";

export const test = fixtures(4);

test.describe.serial("settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/settings");
  });

  test("should update user profile", async ({ page }) => {
    await page.getByPlaceholder("Business Name").click();
    await page.getByPlaceholder("Business Name").fill("Accounsole");
    await page
      .locator("div")
      .filter({ hasText: /^GST Registration: YesNo$/ })
      .getByLabel("No")
      .check();
    await page.getByRole("button", { name: "Save" }).click();

    await page.waitForSelector(
      'p:has-text("Business Details Saved Successfully")'
    );
    expect(
      await page
        .locator('p:has-text("Business Details Saved Successfully")')
        .innerText()
    ).toBe("Business Details Saved Successfully");
  });

  test("should update opening balances", async ({ page }) => {
    await page.goto("http://localhost:3000/settings/opening-balances");

    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill("01/01/2023");
    await page
      .getByRole("option", { name: "Choose Sunday, January 1st, 2023" })
      .click();

    await page.locator(".rdg-row > div:nth-child(5)").first().click();
    await page.getByRole("grid").getByRole("textbox").fill("100");

    await page.locator("div:nth-child(3) > div:nth-child(5)").first().click();
    await page.getByRole("grid").getByRole("textbox").fill("200");

    await page.locator("div:nth-child(4) > div:nth-child(4)").click();
    await page.getByRole("grid").getByRole("textbox").fill("300");
    await page.getByRole("grid").getByRole("textbox").press("Enter");

    await page.getByRole("button", { name: "Post" }).click();

    await page.waitForSelector(
      'p:has-text("Opening balances have been posted!")'
    );

    expect(
      await page
        .locator('p:has-text("Opening balances have been posted!")')
        .innerText()
    ).toBe("Opening balances have been posted!");
  });
});
