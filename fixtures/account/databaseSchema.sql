CREATE TABLE IF NOT EXISTS business_details (
  id INTEGER PRIMARY KEY,
  business_name TEXT,
  GST_registration TEXT,
  new_business TEXT
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id INTEGER PRIMARY KEY,
  name TEXT,
  type TEXT,
  tax_code TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS journal (
  id TEXT,
  type TEXT,
  description TEXT,
  date INTEGER,
  account_id INTEGER,
  account_name TEXT,
  debit REAL,
  credit REAL
);

CREATE TABLE IF NOT EXISTS bank_transactions (
      id INTEGER PRIMARY KEY,
      bankAccountName TEXT,
      date TEXT,
      description TEXT,
      debit REAL,
      credit REAL,
      reconciled TEXT,
      entryId TEXT
    );
