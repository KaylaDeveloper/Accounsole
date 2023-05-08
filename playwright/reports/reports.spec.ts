/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from "./fixtures";
import path from "path";

test.describe.serial("reports", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/bank");
    await page.getByRole("button", { name: "Add Bank Account" }).click();
    await page.getByTestId("bankName").click();
    await page.getByTestId("bankName").fill("CommonWealth Bank");
    await page.getByTestId("bankAccountBSB").click();
    await page.getByTestId("bankAccountBSB").fill("010-010");
    await page.getByTestId("bankAccountNumber").click();
    await page.getByTestId("bankAccountNumber").fill("123456");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("button").nth(1).click();
    await page.waitForSelector("h1:has-text('CommonWealth Bank 3456')");

    await page.getByRole("button", { name: "Upload" }).click();
    await page.getByLabel("Import Bank Transactions(.csv):").click();
    const filePath = path.join(
      process.cwd(),
      "sample-data",
      "test-bank-transactions.csv"
    );
    await page
      .getByLabel("Import Bank Transactions(.csv):")
      .setInputFiles(filePath);
    await page.getByRole("button", { name: "Upload" }).click();
    await page.waitForSelector('p:has-text("File uploaded successfully.")');

    await page.getByRole("link", { name: "Reconcile Transactions" }).click();
    await page.waitForURL(
      "**/bank/52-CommonWealth%20Bank%203456?type=unreconciledTransactions"
    );
    await page.locator(".rdg-row > div:nth-child(5)").first().click();
    await page.getByRole("combobox").selectOption("6 Bank Fees");

    await page.locator("div:nth-child(8) > span").first().click();
    await page.locator("div:nth-child(8) > span").first().click();
    await page.getByRole("combobox").selectOption("No GST");
    await page
      .locator(".rdg-row > div > .rdg-checkbox-label > .rdg-checkbox")
      .first()
      .click();
    await page
      .getByRole("button", { name: "Mark Selected as Reconciled" })
      .click();
    await page.waitForSelector('p:has-text("Reconciled successfully")');

    await page.getByRole("button", { name: "Reports" }).click();
  });

  test("should generate trial balance report", async ({ page }) => {
    await page.getByRole("menuitem", { name: "Trial Balance" }).click();
    await page.waitForURL("**/reports/trial-balance");
    await page.getByRole("button", { name: "Generate Trial Balance" }).click();

    await page.waitForSelector('td:has-text("Bank Fees")');
    expect(await page.locator('td:has-text("Bank Fees")').innerText()).toBe(
      "Bank Fees"
    );
  });

  test("should generate income statement", async ({ page }) => {
    await page.getByRole("menuitem", { name: "Income Statement" }).click();
    await page.waitForURL("**/reports/income-statement");

    await page.getByRole("textbox").first().click();
    await page.getByRole("textbox").first().click();

    await page.getByRole("textbox").first().fill("01/01/2023");

    await page
      .getByRole("option", { name: "Choose Sunday, January 1st, 2023" })
      .click();

    await page
      .getByRole("button", { name: "Generate Income Statement" })
      .click();

    await page.waitForSelector('td:has-text("Bank Fees")');
    expect(await page.locator('td:has-text("Bank Fees")').innerText()).toBe(
      "Bank Fees"
    );
  });

  test("should generate balance sheet", async ({ page }) => {
    await page.getByRole("menuitem", { name: "Balance Sheet" }).click();
    await page.waitForURL("**/reports/balance-sheet");
    await page.getByRole("button", { name: "Generate Balance Sheet" }).click();

    await page.waitForSelector('td:has-text("Retained Earnings")');
    expect(
      await page.locator('td:has-text("Retained Earnings")').innerText()
    ).toBe("Retained Earnings");
  });
});
