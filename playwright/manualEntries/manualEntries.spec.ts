/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "./fixtures";

test.describe.serial("manualEntries", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/manualEntries");
  });

  test("should create manual entries", async ({ page }) => {
    await page.getByRole("link", { name: "Create Manual Entry" }).click();
    await page.waitForURL("**/manualEntries/createManualEntry");

    await page.getByRole("gridcell", { name: "Select a date" }).click();
    await page.getByRole("textbox").fill("2023-04-29");

    await page.getByRole("gridcell", { name: "Enter a description" }).click();
    await page.getByRole("gridcell", { name: "Enter a description" }).click();
    await page.getByRole("textbox").fill("cash sales");

    await page
      .getByRole("gridcell", { name: "Select an account" })
      .first()
      .click();
    await page
      .getByRole("gridcell", { name: "Select an account" })
      .first()
      .click();
    await page.getByRole("combobox").selectOption("1 Sales");

    await page.locator(".rdg-row > div:nth-child(5)").first().click();
    await page.locator(".rdg-row > div:nth-child(5)").first().click();
    await page.getByRole("textbox").fill("100.33");

    await page.getByRole("gridcell", { name: "Select an account" }).click();
    await page.getByRole("combobox").selectOption("34 Cash in Hand");

    await page.locator("div:nth-child(3) > div:nth-child(4)").click();
    await page.locator("div:nth-child(3) > div:nth-child(4)").click();
    await page.getByRole("textbox").fill("100.33");

    await page.getByRole("button", { name: "Post" }).click();
    await page.getByRole("button", { name: "Post" }).click();

    await page.waitForSelector(
      'p:has-text("Manual entry created successfully")'
    );
    expect(
      await page.isVisible('p:has-text("Manual entry created successfully")')
    ).toBe(true);
  });

  test("should edit manual entries", async ({ page }) => {
    await page.getByRole("link", { name: "Update" }).click();
    await page.waitForLoadState("networkidle");
    await page.getByRole("gridcell", { name: "Sales" }).first().click();
    await page.getByRole("gridcell", { name: "Sales" }).first().click();
    await page.getByRole("combobox").selectOption("4 Purchases");

    await page.locator(".rdg-row > div:nth-child(5)").first().click();
    await page.locator(".rdg-row > div:nth-child(5)").first().click();
    await page.getByRole("textbox").first().fill("102");

    await page.locator("div:nth-child(3) > div:nth-child(4)").click();
    await page.locator("div:nth-child(3) > div:nth-child(4)").click();
    await page.getByRole("textbox").fill("102");

    await page.getByRole("gridcell", { name: "cash sales" }).first().click();
    await page.getByRole("textbox").first().fill("cash payment");

    await page.getByRole("button", { name: "Update" }).click();

    await page.waitForSelector(
      'p:has-text("Manual entry created successfully")'
    );
    expect(
      await page.isVisible('p:has-text("Manual entry created successfully")')
    ).toBe(true);
  });

  test("should delete manual entries", async ({ page }) => {
    await page.getByRole("button", { name: "Delete" }).click();

    await page.waitForSelector('p:has-text("Manual Entry Deleted")');
    expect(
      await page.locator('p:has-text("Manual Entry Deleted")').innerText()
    ).toBe("Manual Entry Deleted");
  });
});
