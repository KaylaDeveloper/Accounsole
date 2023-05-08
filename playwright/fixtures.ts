import { test as baseTest, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

export default function fixtures(i: number) {
  const getAccount = (i: number) => {
    return {
      email: `test${i}@gmail.com`,
      password: "123456",
    };
  };
  const account = getAccount(i);

  const test = baseTest.extend<{}, { workerStorageState: string }>({
    storageState: ({ workerStorageState }, use) => use(workerStorageState),

    workerStorageState: [
      async ({ browser }, use) => {
        const id = test.info().parallelIndex;
        const fileName = path.resolve(
          test.info().project.outputDir,
          `.auth/${id}.json`
        );

        if (fs.existsSync(fileName)) {
          await use(fileName);
          return;
        }

        const page = await browser.newPage({ storageState: undefined });

        await page.goto("http://localhost:3000/auth/login");
        await page.getByTestId("email").click();
        await page.getByTestId("email").fill(account.email);
        await page.getByTestId("password").click();
        await page.getByTestId("password").fill(account.password);
        await page.getByRole("button", { name: "Log in" }).click();
        await page.waitForURL("http://localhost:3000/");

        await expect(
          page.getByRole("button", { name: "Sign out" })
        ).toBeVisible();

        await page.context().storageState({ path: fileName });
        await page.close();
        await use(fileName);
      },
      { scope: "worker" },
    ],
  });

  return test;
}
