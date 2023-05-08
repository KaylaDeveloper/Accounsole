import Database from "better-sqlite3";
import type { Database as DatabaseInterface } from "better-sqlite3";
import fs from "fs";
import path from "path";
import type { AccountDetails } from "@/components/modal/AddAccountModal";
import { JournalEntry } from "@/pages/api/bank/markAsReconciled";
import { TrialBalanceAccounts } from "@/pages/reports/trial-balance";

export type RepositoryContext = {
  accountDatabase: DatabaseInterface;
};
export type BusinessDetails = {
  business_name: string;
  GST_registration: boolean;
  new_business: boolean;
};
export type AccountsWithOpeningBalances = {
  id: number;
  name: string;
  type: string;
  debit: number | null;
  credit: number | null;
};
export type BankBalances = {
  name: string;
  debit: number;
  credit: number;
};
export type EntryDetails = {
  accounts: AccountsWithOpeningBalances[];
  date: string;
};
export type EntryType =
  | "Opening balances"
  | "Bank Reconciliation"
  | "Manual Entry";
export type BankTransaction = {
  id: number;
  bankAccountName: string;
  date: string;
  description: string;
  debit: null | number;
  credit: null | number;
  reconciled: boolean;
  entryId: string | null;
};

export default class Repository {
  accountDatabasePath: string;
  accountDatabase: DatabaseInterface;

  constructor(accountId?: string) {
    this.accountDatabasePath = accountId
      ? path.join(
          process.cwd(),
          process.env.SQLITE__ACCOUNT_DB__FOLDER_PATH as string,
          `account-${accountId}.db`
        )
      : path.join(process.cwd(), "data", "account", "unit-test", "test.db");

    this.accountDatabase = new Database(this.accountDatabasePath);
  }

  static createDatabase(accountId?: string): void {
    fs.copyFileSync(
      path.join(process.cwd(), "fixtures", "account", "account-base.db"),
      accountId
        ? path.join(
            process.cwd(),
            process.env.SQLITE__ACCOUNT_DB__FOLDER_PATH as string,
            `account-${accountId}.db`
          )
        : path.join(process.cwd(), "data", "account", "unit-test", "test.db")
    );
  }

  closeDatabase(): void {
    this.accountDatabase.close();
  }

  deleteDatabase() {
    fs.unlinkSync(this.accountDatabasePath);
  }

  getBusinessDetails(): BusinessDetails {
    try {
      const sqlResult = this.accountDatabase
        .prepare(
          "SELECT business_name, GST_registration, new_business FROM business_details WHERE id = 1"
        )
        .get();

      if (!sqlResult) {
        throw new Error("BusinessDetails not found");
      }

      return {
        business_name: sqlResult.business_name,
        GST_registration: sqlResult.GST_registration === "true" ? true : false,
        new_business: sqlResult.new_business === "true" ? true : false,
      };
    } catch (e) {
      throw new Error("Failed to get business details");
    }
  }

  updateBusinessDetails(businessDetails: {
    business_name: string;
    GST_registration: boolean;
    new_business: boolean;
  }): void {
    try {
      this.accountDatabase
        .prepare(
          `
      UPDATE business_details
      SET business_name = ?, GST_registration = ?, new_business = ?
      WHERE id = 1
    `
        )
        .run(
          businessDetails.business_name,
          businessDetails.GST_registration.toString(),
          businessDetails.new_business.toString()
        );
    } catch (e) {
      throw new Error("Failed to update business details");
    }
  }

  getAccountsWithOpeningBalances(): AccountsWithOpeningBalances[] {
    try {
      return this.accountDatabase
        .prepare(
          `SELECT coa.id, coa.name, coa.type,
          CASE
            WHEN j.debit THEN j.debit
            WHEN coa.type IN ('Expense', 'Direct Costs', 'Current Asset', 'Inventory', 'Non-Current Asset', 'Fixed Asset', 'Bank') THEN 0  
            ELSE null
          END AS debit,
          CASE
            WHEN j.credit THEN j.credit
            WHEN coa.type IN ('Revenue', 'Current Liability', 'Non-current Liability', 'Equity') THEN 0  
            ELSE null
          END AS credit
        FROM chart_of_accounts AS coa
        LEFT JOIN journal j ON j.type = 'Opening balances' AND coa.id = j.account_id
        `
        )
        .all();
    } catch (error) {
      throw new Error("Failed to get accounts with opening balances");
    }
  }

  checkIfAccoutExistsBeforeUpdate(accountDetails: AccountDetails) {
    return this.accountDatabase
      .prepare(
        "SELECT name FROM chart_of_accounts WHERE name LIKE '%' || ? || '%' AND type = ?"
      )
      .get(accountDetails.accountName, accountDetails.accountType);
  }

  updateChartOfAccounts(accountDetails: AccountDetails) {
    try {
      const {
        accountName,
        accountType,
        GST,
        description = "",
      } = accountDetails;
      const insert = this.accountDatabase.prepare(
        `INSERT INTO chart_of_accounts ( name, type, tax_code, description) VALUES ( ?, ?, ?, ?)`
      );
      insert.run(accountName, accountType, GST, description);
    } catch (error) {
      throw new Error("Failed to update chart of accounts");
    }
  }

  getAccount(accountDetails: AccountDetails) {
    try {
      const { accountName } = accountDetails;
      return this.accountDatabase
        .prepare(`SELECT * FROM chart_of_accounts WHERE name = ?`)
        .get(accountName);
    } catch (error) {
      throw new Error("Failed to get account");
    }
  }

  createBankTransactions(
    bankTransactions: {
      bankAccountName: string;
      date: string;
      description: string;
      debit: number | null;
      credit: number | null;
    }[]
  ) {
    try {
      const stmt = this.accountDatabase.prepare(
        "INSERT INTO bank_transactions (bankAccountName, date, description, debit, credit, reconciled, entryId) VALUES (?, ?, ?, ?, ?, ?, ?)"
      );
      bankTransactions.forEach((bankTransaction) =>
        stmt.run(
          bankTransaction.bankAccountName,
          bankTransaction.date,
          bankTransaction.description,
          bankTransaction.debit,
          bankTransaction.credit,
          "false",
          null
        )
      );
    } catch (error) {
      throw new Error("Failed to create bank transactions");
    }
  }

  findAllBankTransactionsForSelectedAccount(selectedBankAccount: string) {
    try {
      const bankTransactions = this.accountDatabase
        .prepare(
          "SELECT * FROM bank_transactions WHERE bankAccountName = ? ORDER BY id DESC"
        )
        .all(selectedBankAccount);
      if (bankTransactions.length === 0) {
        return [];
      } else {
        return bankTransactions.map((bankTransaction) => {
          bankTransaction.reconciled =
            bankTransaction.reconciled === "true" ? true : false;
          return bankTransaction;
        });
      }
    } catch (error) {
      throw new Error("Failed to find bank transactions for selected account");
    }
  }

  getBankTransactionById(id: number): {
    id: number;
    date: string;
    description: string;
    bankAccountName: string;
    debit: number | null;
    credit: number | null;
    reconciled: boolean;
    entryId: string;
  } {
    try {
      const bankTransaction = this.accountDatabase
        .prepare("SELECT * FROM bank_transactions WHERE id = ? ")
        .get(id);
      bankTransaction.reconciled =
        bankTransaction.reconciled === "true" ? true : false;
      return bankTransaction;
    } catch (error) {
      throw new Error("Failed to get bank transaction by id");
    }
  }

  getBankBalances(): BankBalances[] | [] {
    try {
      return (
        this.accountDatabase
          .prepare(
            `SELECT bankAccountName AS name,
          SUM(COALESCE(debit, 0)) AS debit,
          SUM(COALESCE(credit, 0)) AS credit
          FROM bank_transactions
          GROUP BY bankAccountName`
          )
          .all() || []
      );
    } catch (error) {
      throw new Error("Failed to get bank balances");
    }
  }

  checkIsDateLaterThanBankTransactions(date: string) {
    return this.accountDatabase
      .prepare("SELECT date FROM bank_transactions WHERE date < ?")
      .get(date);
  }

  markAsReconciled(id: number, entryId: string) {
    try {
      return this.accountDatabase
        .prepare(
          "UPDATE bank_transactions SET reconciled = ?, entryId = ? WHERE id = ?"
        )
        .run("true", entryId, id);
    } catch (error) {
      throw new Error("Failed to mark as reconciled");
    }
  }

  findOpeningBalanceDate(): string | null {
    try {
      return (
        this.accountDatabase
          .prepare("SELECT date FROM journal WHERE type = ?")
          .pluck()
          .get("Opening balances") || null
      );
    } catch (error) {
      throw new Error("Failed to find opening balance date");
    }
  }

  deleteOpeningBalanceEntriesIfExists(): void {
    try {
      this.accountDatabase
        .prepare("DELETE FROM journal WHERE type = 'Opening balances'")
        .run();
    } catch (e) {
      throw new Error("Failed to delete opening balance entries");
    }
  }

  createOpeningBalancesJournalEntry(
    id: string,
    type: EntryType,
    description: string,
    entryDetails: EntryDetails
  ) {
    const { accounts, date } = entryDetails;
    try {
      this.deleteOpeningBalanceEntriesIfExists();

      const stmt = this.accountDatabase.prepare(
        "INSERT INTO journal (id, type, description, date, account_id, account_name, debit, credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      );

      accounts.forEach((account) =>
        stmt.run(
          id,
          type,
          description,
          date.split("T")[0],
          account.id,
          account.name,
          account.debit,
          account.credit
        )
      );
    } catch (error) {
      throw new Error("Failed to create opening balances journal entry");
    }
  }

  createBankReconciliationJournalEntry(
    entryData: JournalEntry[],
    entryId?: string | null
  ) {
    try {
      if (entryId) {
        const deleteStmt = this.accountDatabase
          .prepare("DELETE FROM journal WHERE id = ?")
          .run(entryId);
      }
      const stmt = this.accountDatabase.prepare(
        "INSERT INTO journal (id, type, description, date, account_id, account_name, debit, credit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      );
      entryData.forEach((entry) =>
        stmt.run(
          entry.id,
          entry.type,
          entry.description,
          entry.date,
          entry.account_id,
          entry.account_name,
          entry.debit,
          entry.credit
        )
      );
    } catch (error) {
      throw new Error("Failed to create bank reconciliation journal entry");
    }
  }

  getJournalEntryByEntryId(entryId: string): JournalEntry[] {
    try {
      return (
        this.accountDatabase
          .prepare("SELECT * FROM journal WHERE id = ?")
          .all(entryId) || []
      );
    } catch (error) {
      throw new Error("Failed to get journal entry by entry id");
    }
  }

  findManualEntries() {
    try {
      return (
        this.accountDatabase
          .prepare("SELECT * FROM journal WHERE type = ? ORDER BY id, date ")
          .all("Manual Entry") || []
      );
    } catch (error) {
      throw new Error("Failed to find manual entries");
    }
  }

  getManualEntry(id: string) {
    try {
      return this.accountDatabase
        .prepare("SELECT * FROM journal WHERE id = ?")
        .all(id);
    } catch (error) {
      throw new Error("Failed to get manual entry");
    }
  }

  deleteManualEntry(id: string) {
    try {
      return this.accountDatabase
        .prepare("DELETE FROM journal WHERE id = ?")
        .run(id);
    } catch (error) {
      throw new Error("Failed to delete manual entry");
    }
  }

  getAccountsBalances(date: string): TrialBalanceAccounts[] {
    try {
      return (
        this.accountDatabase
          .prepare(
            `SELECT coa.id, coa.name, coa.type,
           SUM(COALESCE(debit, 0)) AS debit,
           SUM(COALESCE(credit, 0)) AS credit
           FROM chart_of_accounts AS coa
           INNER JOIN journal j ON coa.id = j.account_id
           WHERE j.date <= ?
           GROUP BY coa.id`
          )
          .all(date) || []
      );
    } catch (error) {
      throw new Error("Failed to get accounts balances");
    }
  }

  getIncomeStatementAccountsBalances(
    fromDate: string,
    toDate: string
  ): AccountsWithOpeningBalances[] {
    try {
      return (
        this.accountDatabase
          .prepare(
            `SELECT coa.id, coa.name, coa.type,
          SUM(COALESCE(debit, 0)) AS debit,
          SUM(COALESCE(credit, 0)) AS credit
      FROM chart_of_accounts AS coa
      INNER JOIN journal j ON coa.id = j.account_id AND coa.type IN ('Direct Costs', 'Revenue', 'Expense')
      WHERE j.date BETWEEN ? AND ?
      GROUP BY coa.id`
          )
          .all(fromDate, toDate) || []
      );
    } catch (error) {
      throw new Error("Failed to get income statement accounts balances");
    }
  }

  getMonthlyExpenses(
    months: { month: string; fromDate: string; toDate: string }[]
  ) {
    try {
      const monthlyExpenses: number[] = [];

      months.forEach((month) => {
        const fromDate = month.fromDate;
        const toDate = month.toDate;
        const monethlyExpensesOrIncome =
          this.accountDatabase
            .prepare(
              `SELECT SUM(COALESCE(debit, 0)) - SUM(COALESCE(credit, 0)) AS amount
            FROM journal
            INNER JOIN chart_of_accounts coa ON journal.account_id = coa.id
            WHERE journal.date BETWEEN ? AND ? AND coa.type IN ('Expense', 'Direct Costs')`
            )
            .pluck()
            .get(fromDate, toDate) || 0;
        monthlyExpenses.push(monethlyExpensesOrIncome);
      });

      return monthlyExpenses;
    } catch (error) {
      throw new Error("Failed to get monthly expenses");
    }
  }

  getMonthlyIncome(months: { fromDate: string; toDate: string }[]) {
    try {
      const monthlyIncome: number[] = [];

      months.forEach((month) => {
        const fromDate = month.fromDate;
        const toDate = month.toDate;
        const monethlyExpensesOrIncome =
          this.accountDatabase
            .prepare(
              `SELECT SUM(COALESCE(credit, 0)) - SUM(COALESCE(debit, 0)) AS amount
          FROM journal
          INNER JOIN chart_of_accounts coa ON journal.account_id = coa.id
          WHERE journal.date BETWEEN ? AND ? AND coa.type IN ('Revenue', 'Other Income')`
            )
            .pluck()
            .get(fromDate, toDate) || 0;
        monthlyIncome.push(monethlyExpensesOrIncome);
      });
      return monthlyIncome;
    } catch (error) {
      throw new Error("Failed to get monthly expenses");
    }
  }
}
