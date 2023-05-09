import AccessDenied from "@/components/AccessDenied";
import Layout from "@/components/Layout";
import { GetServerSidePropsContext } from "next";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import Repository, {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/repository";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";
import DataGrid, { Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { Row } from "../bank/[bankAccount]/[id]";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";
import { useMemo, useState } from "react";
import useFilter from "@/components/reactDataGrid/headerRenderer";
import axios from "axios";
import useAlert from "hooks/useAlert";
import { useRouter } from "next/router";

interface ManualEntry extends Omit<Row, "GST"> {
  id: string;
  update: string;
  delete: string;
}

export default function ManualEntries(props: {
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
  manualEntries: {
    id: string;
    date: string;
    description: string;
    accound_id: number;
    debit: number | null;
    credit: number | null;
    account_name: string;
    type: "Manual Entry";
  }[];
  businessDetails: BusinessDetails;
}) {
  const router = useRouter();
  const [alert, setAlert] = useAlert();
  const [filters, setFilters] = useState({
    date: "",
    description: "",
  });

  const { FilterContext, inputStopPropagation, FilterRenderer } =
    useFilter(filters);

  const deleteManualEntry = async (row: ManualEntry) => {
    await axios
      .delete(`/api/manualEntries/deleteManualEntry/${row.id}`)
      .then(() => {
        setAlert("Manual Entry Deleted");
      })
      .catch(() => {
        setAlert("Error Deleting Manual Entry");
      });
    router.replace(location.href);
  };
  const columns: readonly Column<ManualEntry>[] = [
    {
      key: "date",
      name: "Date",
      headerCellClass: "filter-cell",
      resizable: true,
      headerRenderer: (p) => (
        <FilterRenderer<ManualEntry, unknown, HTMLInputElement> {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className="w-full px-2 py-1 text-sm focus:outline-none"
              value={filters.date}
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
      headerCellClass: "filter-cell",
      resizable: true,
      width: 200,
      headerRenderer: (p) => (
        <FilterRenderer<ManualEntry, unknown, HTMLInputElement> {...p}>
          {({ filters, ...rest }) => (
            <input
              {...rest}
              className="w-full px-2 py-1 text-sm focus:outline-none"
              value={filters.description}
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
      key: "account",
      name: "Account",
      resizable: true,
    },
    {
      key: "debit",
      name: "Debit",
      resizable: true,
    },
    {
      key: "credit",
      name: "Credit",
      resizable: true,
    },
    {
      key: "update",
      name: "Update",
      resizable: true,
      formatter: ({ row }) =>
        row.update ? (
          <Link
            className="underline"
            href={`./manualEntries/updateManualEntry?id=${row.id}`}
          >
            Update
          </Link>
        ) : null,
    },
    {
      key: "delete",
      name: "Delete",
      resizable: true,
      formatter: ({ row }) =>
        row.update ? (
          <button className="underline" onClick={() => deleteManualEntry(row)}>
            Delete
          </button>
        ) : null,
    },
  ];

  const rows = props.manualEntries.map((manualEntry, i) => {
    const isFirstLine: boolean =
      props.manualEntries[i - 1]?.id !== manualEntry.id;

    return {
      id: manualEntry.id,
      date: isFirstLine ? manualEntry.date : "",
      description: isFirstLine ? manualEntry.description : "",
      account: manualEntry.account_name,
      debit:
        manualEntry.debit === null
          ? ""
          : turnNumberIntoAudFormat(manualEntry.debit),
      credit:
        manualEntry.credit === null
          ? ""
          : turnNumberIntoAudFormat(manualEntry.credit),
      update: isFirstLine ? "Update" : "",
      delete: isFirstLine ? "Delete" : "",
    };
  });

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      return (
        (filters.date ? r.date.includes(filters.date) : true) &&
        (filters.description
          ? r.description.includes(filters.description)
          : true)
      );
    });
  }, [rows, filters]);

  if (!props.businessDetails)
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );

  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="flex flex-col justify-center items-center gap-16 relative w-full px-6">
        <Link
          className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue mt-8"
          href="./manualEntries/createManualEntry"
        >
          Create Manual Entry
        </Link>
        <p className="absolute top-20">{alert}</p>
        {props.manualEntries.length > 0 && (
          <div className="max-w-full">
            <FilterContext.Provider value={filters}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                headerRowHeight={70}
                className="rdg-light fill-grid"
              />
            </FilterContext.Provider>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps(
  (props: any, context: GetServerSidePropsContext, repository?: Repository) => {
    if (!repository) return props;

    return {
      ...props,
      manualEntries: repository.findManualEntries(),
      accountsWithOpeningBalances: repository.getAccountsWithOpeningBalances(),
    };
  }
);
