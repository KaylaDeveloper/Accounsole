# Accounsole Accounting Software

Accounsole is a Next.js accounting software project that helps sole traders manage their finances.

Features

- Import bank transactions from CSV files
- Reconcile bank transactions with ease
  - Easily reconcile bank transactions by selecting multiple transactions and marking them as reconciled at once using the 'Mark selected as Reconciled' option
  - Split a single transaction into multiple accounts by dividing the transaction amount among multiple accounts
  - Update previously reconciled transactions through the details page
  - Filter bank transactions based on parameters like date, description, and amount
- Create, update or delete manual entries as needed
- Generate financial reports, including trial balance, income statement, and balance sheet
- Add opening balances for businesses transitioning to Accounsole

## Clone and Run the Project

To get started, clone the project repository by running the following command in your terminal:

```bash
git clone https://github.com/KaylaDeveloper/Accounsole.git
```

Then, navigate to the project directory and install the necessary dependencies by running one of the following commands, depending on your package manager of choice:

```bash
npm install
```

```bash
yarn install
```

```bash
pnpm install
```

Finally, start the development server by running one of the following commands:

```bash
npm run dev
```

```bash
yarn run dev
```

```bash
pnpm run dev
```

## Create .env.local File

In current working directory, create .env.local file and add below environment variables to enable sending reset-password-link function

```
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

## Sample Data

Try the software using the test-bank-transaction.csv file in sample-data folder

## Run Jest Tests

To run Jest tests, use one of the following commands:

```bash
npm run test
```

```bash
yarn run test
```

```bash
pnpm run test
```

## Run Playwright End-to-End Tests

To run Playwright end-to-end tests, use one of the following commands:

```bash
npm run e2e
npm run e2e-test
```

```bash
yarn run e2e
yarn run e2e-test
```

```bash
pnpm run e2e
pnpm run e2e-test
```
