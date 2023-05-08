import { Filter, Row } from "@/pages/bank/[bankAccount]";
import { useMemo, useState } from "react";
import useFilter from "../reactDataGrid/headerRenderer";
import DataGrid, { Column } from "react-data-grid";
import Link from "next/link";
import { BankTransaction } from "services/repository/repository";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";

export default function AllTransactions(props: {
  allBankTransactionsForSelectedAccount: BankTransaction[];
  bankAccount: string;
}) {
  const bankAccount = props.bankAccount;
  const [filters, setFilters] = useState<Filter>({
    date: "",
    description: "",
    debit: "",
    credit: "",
    reconciled: "",
  });

  const {
    FilterContext,
    inputStopPropagation,
    selectStopPropagation,
    FilterRenderer,
  } = useFilter(filters);

  const columns = useMemo((): readonly Column<Row>[] => {
    return [
      {
        key: "id",
        name: "ID",
      },
      {
        key: "date",
        name: "Date",
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="w-full px-2 py-1 text-sm focus:outline-none"
                value={filters?.date}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    date: e.target.value,
                  })
                }
                onKeyDown={inputStopPropagation}
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "description",
        name: "Description",
        width: 400,
        resizable: true,
        headerCellClass: "filter-cell",
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="w-full px-2 py-1 text-sm focus:outline-none"
                value={filters?.description}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    description: e.target.value,
                  })
                }
                onKeyDown={inputStopPropagation}
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "debit",
        name: "Debit",
        headerCellClass: "filter-cell",
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="w-full px-2 py-1 text-sm focus:outline-none"
                value={filters?.debit}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    debit: e.target.value,
                  })
                }
                onKeyDown={inputStopPropagation}
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "credit",
        name: "Credit",
        headerCellClass: "filter-cell",
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLInputElement> {...p}>
            {({ filters, ...rest }) => (
              <input
                {...rest}
                className="w-full px-2 py-1 text-sm focus:outline-none"
                value={filters?.credit}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    credit: e.target.value,
                  })
                }
                onKeyDown={inputStopPropagation}
              />
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "reconciled",
        name: "Reconciled",
        headerCellClass: "filter-cell",
        headerRenderer: (p) => (
          <FilterRenderer<Row, unknown, HTMLSelectElement> {...p}>
            {({ filters, ...rest }) => (
              <select
                {...rest}
                className="w-full px-2 py-1 text-sm focus:outline-none"
                value={filters?.reconciled}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    reconciled: e.target.value,
                  })
                }
                onKeyDown={selectStopPropagation}
              >
                <option value="">All</option>
                <option value="true">Reconciled</option>
                <option value="false">Unreconciled</option>
              </select>
            )}
          </FilterRenderer>
        ),
      },
      {
        key: "details",
        name: "Details",
        formatter(props) {
          return (
            <Link href={`/bank/${bankAccount}/${props.row.id}`}>Details</Link>
          );
        },
      },
    ];
  }, [
    FilterRenderer,
    bankAccount,
    inputStopPropagation,
    selectStopPropagation,
  ]);

  const bankTransactions = props.allBankTransactionsForSelectedAccount.map(
    (transaction) => {
      return {
        id: transaction.id,
        description: transaction.description,
        date: transaction.date,
        debit:
          transaction.debit === null
            ? ""
            : turnNumberIntoAudFormat(transaction.debit),
        credit:
          transaction.credit === null
            ? ""
            : turnNumberIntoAudFormat(transaction.credit),
        reconciled: transaction.reconciled,
        details: "Details",
      };
    }
  );

  const filteredRows = useMemo(() => {
    return bankTransactions.filter((r) => {
      return (
        (filters.date ? r.date.includes(filters.date) : true) &&
        (filters.description
          ? r.description.includes(filters.description)
          : true) &&
        (filters.debit ? r.debit.includes(filters.debit) : true) &&
        (filters.credit ? r.credit.includes(filters.credit) : true) &&
        (filters.reconciled
          ? filters.reconciled === "true"
            ? r.reconciled
            : !r.reconciled
          : true)
      );
    });
  }, [bankTransactions, filters]);

  return (
    <section className="py-14  h-full w-full px-10 flex flex-col">
      <FilterContext.Provider value={filters}>
        <DataGrid
          columns={columns}
          rows={filteredRows}
          headerRowHeight={70}
          className="border-2 border-gray-200 border-collapse flex-grow rdg-light fill-grid"
        />
      </FilterContext.Provider>
    </section>
  );
}
