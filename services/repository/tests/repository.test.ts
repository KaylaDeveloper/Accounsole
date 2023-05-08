import bankTransactions from "./testBankTransactions";
import Repository from "../repository";
import uuid from "uuid-random";
import { entryData, entryIds } from "./testEntryData";

let context: RepositoryContext;

const allMonths = [
  { month: "07", fromDate: `2022-07-01`, toDate: `2022-07-31` },
  { month: "08", fromDate: `2022-08-01`, toDate: `2022-08-31` },
  { month: "09", fromDate: `2022-09-01`, toDate: `2022-09-31` },
  { month: "10", fromDate: `2022-10-01`, toDate: `2022-10-31` },
  { month: "11", fromDate: `2022-11-01`, toDate: `2022-11-31` },
  { month: "12", fromDate: `2022-12-01`, toDate: `2022-12-31` },
  { month: "01", fromDate: `2023-01-01`, toDate: `2023-01-31` },
  { month: "02", fromDate: `2023-02-01`, toDate: `2023-02-31` },
  { month: "03", fromDate: `2023-03-01`, toDate: `2023-03-31` },
  { month: "04", fromDate: `2023-04-01`, toDate: `2023-04-31` },
  { month: "05", fromDate: `2023-05-01`, toDate: `2023-05-31` },
  { month: "06", fromDate: `2023-06-01`, toDate: `2023-06-31` },
];

const repository = new Repository();
const accountDatabase = repository.accountDatabase;

beforeAll(() => {
  Repository.createDatabase();
});

describe("test business details", () => {
  it("should return business details", () => {
    const business = repository.getBusinessDetails();
    expect(business).toEqual({
      business_name: "",
      GST_registration: true,
      new_business: false,
    });
  });

  it("should update business details", () => {
    repository.updateBusinessDetails({
      business_name: "Test Business",
      GST_registration: true,
      new_business: false,
    });
    const business = repository.getBusinessDetails();
    expect(business).toEqual({
      business_name: "Test Business",
      GST_registration: true,
      new_business: false,
    });
  });
});

describe("test chart of accounts", () => {
  it("should get accounts with opening balances", () => {
    const accounts = repository.getAccountsWithOpeningBalances();
    expect(accounts).toHaveLength(51);
    expect(accounts[0]).toEqual({
      id: 1,
      name: "Sales",
      type: "Revenue",
      debit: null,
      credit: 0,
    });
    expect(accounts[50]).toEqual({
      id: 51,
      name: "Retained Earnings",
      type: "Equity",
      debit: null,
      credit: 0,
    });
  });

  it("should insert into chart of accounts", () => {
    const account = repository.checkIfAccoutExistsBeforeUpdate({
      accountName: "Westpac 1234",
      accountType: "Bank",
      GST: "GST free",
    });
    if (!account) {
      repository.updateChartOfAccounts({
        accountName: "Westpac 1234",
        accountType: "Bank",
        GST: "GST free",
        description: "Westpac 110-110 56781234",
      });
    }

    const accounts = repository.getAccountsWithOpeningBalances();
    expect(accounts).toHaveLength(52);
    expect(accounts[51]).toEqual({
      id: 52,
      name: "Westpac 1234",
      type: "Bank",
      debit: 0,
      credit: null,
    });

    const addedAccount = repository.getAccount({
      accountName: "Westpac 1234",
      accountType: "Bank",
      GST: "GST free",
    });
    expect(addedAccount).toEqual({
      id: 52,
      name: "Westpac 1234",
      type: "Bank",
      tax_code: "GST free",
      description: "Westpac 110-110 56781234",
    });
  });
});

describe("test bank transactions", () => {
  beforeAll(() => {
    bankTransactions.forEach((bankTransaction) => {
      bankTransaction.bankAccountName = "Westpac 1234";
    });
    repository.createBankTransactions(bankTransactions);
  });

  it("should find bank transactions for selected account", () => {
    const transactions =
      repository.findAllBankTransactionsForSelectedAccount("Westpac 1234");
    expect(transactions).toHaveLength(23);

    expect(transactions[0]).toEqual({
      id: 23,
      bankAccountName: "Westpac 1234",
      date: "2023-03-01",
      description: "Account Fee",
      debit: null,
      credit: 4,
      reconciled: false,
      entryId: null,
    });
  });

  it("should get bank transaction by id", () => {
    const transaction = repository.getBankTransactionById(23);
    expect(transaction).toEqual({
      id: 23,
      bankAccountName: "Westpac 1234",
      date: "2023-03-01",
      description: "Account Fee",
      debit: null,
      credit: 4,
      reconciled: false,
      entryId: null,
    });
  });

  it("should get bank balances", () => {
    const balances = repository.getBankBalances();
    expect(balances).toEqual([
      {
        name: "Westpac 1234",
        debit: 7755,
        credit: 822.46,
      },
    ]);
  });
});

describe("test journal entries", () => {
  const id = uuid();

  it("should create opening balances journal entry", () => {
    const description = "Opening balances";
    const type = "Opening balances";
    const accounts = [
      {
        id: 34,
        name: "Cash in Hand",
        type: "Current Asset",
        debit: 1000,
        credit: null,
      },
      {
        id: 52,
        name: "Westpac 1234",
        type: "Bank",
        debit: 2522.53,
        credit: null,
      },
      {
        id: 48,
        name: "Owner's Drawings",
        type: "Equity",
        debit: null,
        credit: -1100,
      },

      {
        id: 49,
        name: "Owner's Capital",
        type: "Equity",
        debit: null,
        credit: 400,
      },
      {
        id: 51,
        name: "Retained Earnings",
        type: "Equity",
        debit: null,
        credit: 4222.53,
      },
    ];
    const entryDetails = {
      accounts,
      date: new Date("2022-07-01").toISOString(),
    };

    repository.createOpeningBalancesJournalEntry(
      id,
      description,
      type,
      entryDetails
    );

    const journalEntry = repository.getJournalEntryByEntryId(id);
    expect(journalEntry).toEqual([
      {
        id,
        type,
        description,
        date: "2022-07-01",
        account_id: 34,
        account_name: "Cash in Hand",
        debit: 1000,
        credit: null,
      },
      {
        id,
        type,
        description,
        date: "2022-07-01",
        account_id: 52,
        account_name: "Westpac 1234",
        debit: 2522.53,
        credit: null,
      },
      {
        id,
        type,
        description,
        date: "2022-07-01",
        account_id: 48,
        account_name: "Owner's Drawings",
        debit: null,
        credit: -1100,
      },
      {
        id,
        type,
        description,
        date: "2022-07-01",
        account_id: 49,
        account_name: "Owner's Capital",
        debit: null,
        credit: 400,
      },
      {
        id,
        type,
        description,
        date: "2022-07-01",
        account_id: 51,
        account_name: "Retained Earnings",
        debit: null,
        credit: 4222.53,
      },
    ]);
  });

  it("should find opening balances journal entry date", () => {
    const date = repository.findOpeningBalanceDate();
    expect(date).toEqual("2022-07-01");
  });

  it("should delete opening balances journal entry", () => {
    repository.deleteOpeningBalanceEntriesIfExists();

    const journalEntry = repository.getJournalEntryByEntryId(id);

    expect(journalEntry).toEqual([]);
  });

  it("should create journal entry", () => {
    repository.createBankReconciliationJournalEntry(entryData);

    const journalEntry = repository.getJournalEntryByEntryId(entryIds[0]);

    expect(journalEntry).toEqual([
      {
        id: entryIds[0],
        type: "Bank Reconciliation",
        description: bankTransactions[0].description,
        date: bankTransactions[0].date,
        account_id: 52,
        account_name: "Westpac 1234",
        debit: 2200,
        credit: null,
      },
      {
        id: entryIds[0],
        type: "Bank Reconciliation",
        description: bankTransactions[0].description,
        date: bankTransactions[0].date,
        account_id: 1,
        account_name: "Sales",
        debit: null,
        credit: 2000,
      },
      {
        id: entryIds[0],
        type: "Bank Reconciliation",
        description: bankTransactions[0].description,
        date: bankTransactions[0].date,
        account_id: 44,
        account_name: "GST",
        debit: null,
        credit: 200,
      },
    ]);
  });
});

describe("test manual entries", () => {
  it("find manual entries", () => {
    const manualEntries = repository.findManualEntries();
    expect(manualEntries).toEqual([
      {
        id: entryIds[1],
        type: "Manual Entry",
        description: "Cash Payment",
        date: "2023-01-01",
        account_id: 7,
        account_name: "Cleaning",
        debit: 100,
        credit: null,
      },
      {
        id: entryIds[1],
        type: "Manual Entry",
        description: "Cash Payment",
        date: "2023-01-01",
        account_id: 44,
        account_name: "GST",
        debit: 10,
        credit: null,
      },
      {
        id: entryIds[1],
        type: "Manual Entry",
        description: "Cash Payment",
        date: "2023-01-01",
        account_id: 34,
        account_name: "Cash in Hand",
        debit: null,
        credit: 110,
      },
    ]);
  });

  it("should get manual entry by id", () => {
    const manualEntry = repository.getManualEntry(entryIds[1]);
    expect(manualEntry).toEqual([
      {
        id: entryIds[1],
        type: "Manual Entry",
        description: "Cash Payment",
        date: "2023-01-01",
        account_id: 7,
        account_name: "Cleaning",
        debit: 100,
        credit: null,
      },
      {
        id: entryIds[1],
        type: "Manual Entry",
        description: "Cash Payment",
        date: "2023-01-01",
        account_id: 44,
        account_name: "GST",
        debit: 10,
        credit: null,
      },
      {
        id: entryIds[1],
        type: "Manual Entry",
        description: "Cash Payment",
        date: "2023-01-01",
        account_id: 34,
        account_name: "Cash in Hand",
        debit: null,
        credit: 110,
      },
    ]);
  });

  it("should delete manual entry", () => {
    repository.deleteManualEntry(entryIds[1]);

    const manualEntry = repository.getManualEntry(entryIds[1]);

    expect(manualEntry).toEqual([]);
  });
});

describe("test reports", () => {
  it("should get accounts balance", () => {
    const accountsBalance = repository.getAccountsBalances("2023-04-01");

    expect(accountsBalance).toEqual([
      {
        id: 1,
        name: "Sales",
        type: "Revenue",
        debit: 0,
        credit: 2000,
      },
      {
        id: 44,
        name: "GST",
        type: "Current Liability",
        debit: 0,
        credit: 200,
      },
      {
        id: 52,
        name: "Westpac 1234",
        type: "Bank",
        debit: 2200,
        credit: 0,
      },
    ]);
  });

  it("should get income statement accounts balances", () => {
    const accountsBalance = repository.getIncomeStatementAccountsBalances(
      "2023-03-01",
      "2023-04-01"
    );

    expect(accountsBalance).toEqual([
      {
        id: 1,
        name: "Sales",
        type: "Revenue",
        debit: 0,
        credit: 2000,
      },
    ]);
  });

  it("should get monthly income", () => {
    const monthlyIncome = repository.getMonthlyIncome(allMonths);
    expect(monthlyIncome).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 2000, 0, 0, 0]);
  });

  it("should get monthly expenses", () => {
    const monthlyExpenses = repository.getMonthlyExpenses(allMonths);
    expect(monthlyExpenses).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });
});

afterAll(() => {
  repository.closeDatabase();
  repository.deleteDatabase();
});
