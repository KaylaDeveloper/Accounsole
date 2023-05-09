import { Formik, Field } from "formik";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import InputFields from "@/components/TextInputField";
import Button from "@/components/Button";
import AccessDenied from "@/components/AccessDenied";
import Layout from "@/components/Layout";
import { BusinessDetails } from "services/repository/Repository.ts";
import { useRouter } from "next/navigation";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import Link from "next/link";
import FormWrapper from "@/components/FormWrapper";
import useAlert from "hooks/useAlert";

export default function Settings(props: { businessDetails: BusinessDetails }) {
  const router = useRouter();

  const [alert, setAlert] = useAlert();

  if (!props.businessDetails)
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );

  const saveBusinessInfo = async (values: {
    business_name: string;
    GST_registration: string;
    new_business: string;
  }) => {
    await axios
      .post("/api/settings/businessDetails", {
        business_name: values.business_name,
        GST_registration: values.GST_registration === "true" ? true : false,
        new_business: values.new_business === "true" ? true : false,
      })
      .then(() => setAlert("Business Details Saved Successfully"))
      .catch((error) => setAlert(error.response.data));
  };

  return (
    <Layout businessDetails={props.businessDetails}>
      <FormWrapper title={"Business Details"} alert={alert}>
        <Formik
          initialValues={{
            business_name: props.businessDetails.business_name,
            GST_registration: props.businessDetails.GST_registration
              ? "true"
              : "false",
            new_business: props.businessDetails.new_business ? "true" : "false",
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await saveBusinessInfo(values);

            router.replace(location.href);
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
            <form onSubmit={handleSubmit}>
              <InputFields
                name="business_name"
                type="text"
                label="Business Name:"
                value={values.business_name}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Business Name"
              />

              <div className="mb-6 flex items-baseline gap-6">
                <span className="basis-1/2">GST Registration: </span>
                <div role="group" className="flex gap-6 basis-1/2">
                  <label>
                    <Field type="radio" name="GST_registration" value="true" />
                    Yes
                  </label>
                  <label>
                    <Field type="radio" name="GST_registration" value="false" />
                    No
                  </label>
                </div>
              </div>

              <div className="mb-6 flex items-baseline gap-6">
                <span className="basis-1/2">New Business: </span>
                <div role="group" className="flex gap-6 basis-1/2">
                  <label>
                    <Field type="radio" name="new_business" value="true" />
                    Yes
                  </label>
                  <label>
                    <Field type="radio" name="new_business" value="false" />
                    No
                  </label>
                </div>
              </div>

              {!props.businessDetails.new_business && (
                <Link
                  href="/settings/opening-balances"
                  className="text-xs underline italic"
                >
                  Fill in opening balances for existing business
                </Link>
              )}
              <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting}>
                  Save
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </FormWrapper>
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps();
