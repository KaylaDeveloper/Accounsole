# Accounsole Accounting Software

Accounsole is an accounting software helping sole traders manage their finances.

Stack

- Typescript
- React — UI Framework
- Tailwind CSS — CSS Framework
- Next.js — Http App Framework
- SQLite — Database
  - Multi-tenant database "Global" - Using Prisma Orm (Used for authentication)
  - Single-tenant database "Account" — Using better-sqlite3
- Jest — Unit testing
- Playright — E2E testing

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

## Running Accounsole

To get started, clone the project repository:

```bash
git clone https://github.com/KaylaDeveloper/Accounsole.git
```

Then, navigate to the project directory and install the dependencies:

```bash
npm install
```

Finally, start the development server by running one of the following commands:

```bash
npm run dev
```

## Sample Data

You can test the import feature using the following file:
https://github.com/KaylaDeveloper/Accounsole/blob/main/sample-data/test-bank-transactions.csv

## Unit Tests — Jest

```bash
npm run test
```

## E2E Tests — Playwright

```bash
npm run e2e-test
```
