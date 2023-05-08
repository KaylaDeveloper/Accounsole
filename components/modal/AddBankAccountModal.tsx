import axios from "axios";
import { Dispatch, SetStateAction } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { AccountsWithOpeningBalances } from "../../services/repository/repository";
import Modal from "./Modal";
import useAlert from "hooks/useAlert";

export type BankAccountDetails = {
  bankName: string;
  bankAccountBSB: string;
  bankAccountNumber: string;
};

export default function AddBankAccountModal({
  isAddBankAccountModalOpen,
  closeModal,
  accounts,
  setAccounts,
}: {
  isAddBankAccountModalOpen: boolean;
  closeModal: () => void;
  accounts: AccountsWithOpeningBalances[];
  setAccounts: Dispatch<SetStateAction<AccountsWithOpeningBalances[]>>;
}) {
  const [alert, setAlert] = useAlert();

  const handleAddBankAccount = async (values: BankAccountDetails) => {
    await axios
      .post("/api/settings/addBankAccount", {
        bankName: values.bankName,
        bankAccountBSB: values.bankAccountBSB,
        bankAccountNumber: values.bankAccountNumber,
      })
      .then((res) => {
        setAlert("Bank Account Added Successfully");
        values.bankAccountBSB = "";
        values.bankAccountNumber = "";
        values.bankName = "";

        const newAccounts = [...accounts];
        const { id, name, type } = res.data;
        newAccounts.push(res.data);

        setAccounts([...accounts, { id, name, type, debit: 0, credit: null }]);
      })
      .catch((error) => setAlert(error.response.data));
  };

  const AddBankAccountSchema = Yup.object().shape({
    bankName: Yup.string().required("This field is required"),
    bankAccountBSB: Yup.string().required("This field is required"),
    bankAccountNumber: Yup.string().required("This field is required"),
  });

  return (
    <Modal
      isModalOpen={isAddBankAccountModalOpen}
      closeModal={closeModal}
      error={alert}
      title="Please Add Bank Account Here"
    >
      <Formik
        initialValues={{
          bankName: "",
          bankAccountBSB: "",
          bankAccountNumber: "",
        }}
        validationSchema={AddBankAccountSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleAddBankAccount(values);

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
              <label htmlFor="bankName" className="basis-1/2">
                Bank Name:
              </label>
              <input
                id="bankName"
                name="bankName"
                type="text"
                placeholder="Commonwealth Bank"
                className="basis-1/2 border-2 px-1 rounded"
                value={values.bankName}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="bankName"
              />
              <span className="absolute top-8 text-xs right-8">
                {errors.bankName && touched.bankName && errors.bankName}
              </span>
            </div>

            <div className="flex mb-6">
              <label htmlFor="bankAccountBSB" className="basis-1/2">
                Bank Account BSB:{" "}
              </label>
              <input
                id="bankAccountBSB"
                name="bankAccountBSB"
                type="text"
                placeholder="010-010"
                className="basis-1/2 border-2 px-1 rounded"
                value={values.bankAccountBSB}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="bankAccountBSB"
              />
            </div>

            <div className="flex mb-8">
              <label htmlFor="bankAccountNumber" className="basis-1/2">
                Bank Account Number:{" "}
              </label>
              <input
                id="bankAccountNumber"
                name="bankAccountNumber"
                type="text"
                placeholder="123456789"
                className="basis-1/2 border-2 px-1 rounded"
                value={values.bankAccountNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                data-testid="bankAccountNumber"
              />
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
