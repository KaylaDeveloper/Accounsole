import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { AccountsWithOpeningBalances } from "../../services/repository/Repository.ts";
import Modal from "./Modal";
import React from "react";
import useAlert from "hooks/useAlert";

export type AccountType =
  | "Revenue"
  | "Expense"
  | "Direct Costs"
  | "Current Asset"
  | "Inventory"
  | "Non-Current Asset"
  | "Fixed Asset"
  | "Current Liability"
  | "Non-current Liability"
  | "Equity"
  | "Bank";

export type AccountDetails = {
  accountName: string;
  accountType: AccountType;
  GST: "GST on" | "GST free";
  description?: string;
};

export default function AddAccountModal({
  isAddAccountModalOpen,
  closeModal,
  accounts,
  setAccounts,
}: {
  isAddAccountModalOpen: boolean;
  closeModal: () => void;
  accounts: AccountsWithOpeningBalances[];
  setAccounts: Dispatch<SetStateAction<AccountsWithOpeningBalances[]>>;
}) {
  const [alert, setAlert] = useAlert();

  const handleAddAccount = async (values: AccountDetails) => {
    await axios
      .post("/api/settings/addAccount", {
        accountName: values.accountName,
        accountType: values.accountType,
        GST: values.GST,
      })
      .then((res) => {
        setAlert("Account Added Successfully");
        values.accountName = "";
        values.accountType = "Revenue";
        values.GST = "GST on";

        const newAccounts = [...accounts];
        const { id, name, type } = res.data;
        if (
          type === "Revenue" ||
          type === "Current Liability" ||
          type === "Non-current Liability" ||
          type === "Equity"
        ) {
          newAccounts.push({ id, name, type, debit: null, credit: 0 });
        } else {
          newAccounts.push({ id, name, type, debit: 0, credit: null });
        }
        setAccounts(newAccounts);
      })
      .catch((error) => setAlert(error.response.data));
  };

  const AddAccountSchema = Yup.object().shape({
    accountName: Yup.string().required("This field is required"),
  });

  return (
    <Modal
      isModalOpen={isAddAccountModalOpen}
      closeModal={closeModal}
      error={alert}
      title="Please Add Account Here"
    >
      <Formik
        initialValues={{
          accountName: "",
          accountType: "Revenue",
          GST: "GST on",
        }}
        validationSchema={AddAccountSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleAddAccount(values as AccountDetails);

          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleSubmit,
          handleBlur,
          isSubmitting,
        }) => (
          <form className="mt-8" onSubmit={handleSubmit}>
            <div className="flex mb-6 relative">
              <label htmlFor="accountName" className="basis-1/2">
                Account Name:
              </label>
              <input
                id="accountName"
                name="accountName"
                type="text"
                placeholder="Account Name"
                className="basis-1/2 border-2 -ml-6 px-1 rounded"
                value={values.accountName}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <span className="absolute top-8 text-xs right-8">
                {errors.accountName &&
                  touched.accountName &&
                  errors.accountName}
              </span>
            </div>

            <div className="flex mb-6">
              <label htmlFor="accountType" className="basis-1/2">
                Account Type:{" "}
              </label>
              <select
                id="accountType"
                name="accountType"
                className="basis-1/2 -ml-6 border-2 px-1 rounded"
                value={values.accountType}
                onChange={handleChange}
              >
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
                <option value="Direct Costs">Direct Costs</option>
                <option value="Current Asset">Current Asset</option>
                <option value="Inventory">Inventory</option>
                <option value="Non-Current Asset">Non-current Asset</option>
                <option value="Fixed Asset">Fixed Asset</option>
                <option value="Current Liability">Current Liability</option>
                <option value="Non-current Liability">
                  Non-current Liability
                </option>
                <option value="Equity">Equity</option>
              </select>
            </div>

            <div className="flex mb-8">
              <label htmlFor="GST" className="basis-1/2">
                GST:{" "}
              </label>
              <select
                id="GST"
                name="GST"
                className="basis-1/2 -ml-6 border-2 px-1 rounded"
                value={values.GST}
                onChange={handleChange}
              >
                <option value="GST on">GST on</option>
                <option value="GST free">GST free</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1 grid place-center rounded border border-transparent bg-primary-color font-medium text-blue-900 hover:bg-dark-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Save
            </button>
          </form>
        )}
      </Formik>
    </Modal>
  );
}
