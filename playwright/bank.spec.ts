/* eslint-disable testing-library/prefer-screen-queries */
import { expect } from "./fixtures";
import path from "path";
import fixtures from "./fixtures";

export const test = fixtures(1);

test.describe.serial("bank", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/bank");
  });

  test("should add bank account", async ({ page }) => {
    await page.getByRole("button", { name: "Add Bank Account" }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForSelector('span:has-text("This field is required")');
    expect(
      await page.locator('span:has-text("This field is required")').innerText()
    ).toBe("This field is required");

    await page.getByTestId("bankName").click();
    await page.getByTestId("bankName").fill("CommonWealth Bank");
    await page.getByTestId("bankAccountBSB").click();
    await page.getByTestId("bankAccountBSB").fill("010-010");
    await page.getByTestId("bankAccountNumber").click();
    await page.getByTestId("bankAccountNumber").fill("123456");
    await page.getByRole("button", { name: "Save" }).click();
    await page.getByRole("button").nth(1).click();

    await page.waitForSelector("h1:has-text('CommonWealth Bank 3456')");
    expect(
      await page.locator('h1:has-text("CommonWealth Bank 3456")').innerText()
    ).toBe("CommonWealth Bank 3456");
  });

  test("should import csv file", async ({ page }) => {
    await page.getByRole("button", { name: "Upload" }).click();
    await page.waitForSelector('p:has-text("Please select a file.")');
    expect(
      await page.locator('p:has-text("Please select a file.")').innerText()
    ).toBe("Please select a file.");

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
    expect(
      await page
        .locator('p:has-text("File uploaded successfully.")')
        .innerText()
    ).toBe("File uploaded successfully.");
  });

  test("should reconcile bank transactions", async ({ page }) => {
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

    expect(
      await page.locator('p:has-text("Reconciled successfully")').innerText()
    ).toBe("Reconciled successfully");
  });

  test("should reconcile splitted bank transactions", async ({ page }) => {
    await page.getByRole("link", { name: "Reconcile Transactions" }).click();
    await page.waitForURL(
      "**/bank/52-CommonWealth%20Bank%203456?type=unreconciledTransactions"
    );
    await page.locator("div:nth-child(3) > div:nth-child(9) > button").click();

    await page.locator("div:nth-child(4) > div:nth-child(5) > span").click();
    await page.getByRole("combobox").selectOption("7 Cleaning");

    await page.locator("div:nth-child(4) > div:nth-child(8)").click();
    await page.locator("div:nth-child(4) > div:nth-child(8)").click();
    await page.getByRole("combobox").selectOption("GST Included");

    await page.locator("div:nth-child(5) > div:nth-child(5) > span").click();
    await page.getByRole("combobox").selectOption("14 General Expenses");

    await page.locator("div:nth-child(5) > div:nth-child(8) > span").click();
    await page.locator("div:nth-child(5) > div:nth-child(8) > span").click();
    await page.getByRole("combobox").selectOption("GST Included");

    await page.locator("div:nth-child(4) > div:nth-child(6)").click();
    await page.getByRole("textbox").fill("1");
    await page.locator("div:nth-child(5) > div:nth-child(6)").click();
    await page.getByRole("textbox").fill("2");
    await page.getByRole("button", { name: "Mark as Reconciled" }).click();

    await page.waitForSelector('p:has-text("Reconciled successfully")');
    expect(
      await page.locator('p:has-text("Reconciled successfully")').innerText()
    ).toBe("Reconciled successfully");
  });

  test("should be able to re-reconcile bank transactions in detail page", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "commonwealth bank 3456" }).click();
    await page.locator(".rdg-cell > a").first().click();
    await page.getByRole("button", { name: "Add New row" }).click();
    await page.getByRole("gridcell", { name: "Select an account" }).click();
    await page.getByRole("combobox").selectOption("7 Cleaning");
    await page.getByRole("gridcell", { name: "Select GST" }).first().click();
    await page.getByRole("gridcell", { name: "Select GST" }).first().click();
    await page.getByRole("combobox").selectOption("GST Included");
    await page.locator("div:nth-child(3) > div:nth-child(4)").click();
    await page.locator("div:nth-child(3) > div:nth-child(4)").click();
    await page.getByRole("textbox").fill("4");
    await page.getByRole("button", { name: "Redo Reconciliation" }).click();
    await page.getByRole("button", { name: "Redo Reconciliation" }).click();
    await page.waitForSelector('p:has-text("Reconciled successfully")');
    expect(
      await page.locator('p:has-text("Reconciled successfully")').innerText()
    ).toBe("Reconciled successfully");
  });
});
