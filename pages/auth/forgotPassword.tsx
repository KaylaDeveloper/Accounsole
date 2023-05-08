import { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import FormWrapper from "@/components/FormWrapper";
import TextInputField from "@/components/TextInputField";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import useAlert from "hooks/useAlert";

export default function ForgotPasswordForm() {
  const [alert, setAlert] = useAlert();
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const forgotPassword = async (values: any) => {
    await axios
      .post("/api/auth/forgotPassword", {
        email: values.email,
      })
      .then(() => setResetLinkSent(true))
      .catch((error: any) => {
        setAlert(error.response.data.msg);
      });
  };

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("This field is required"),
  });

  if (resetLinkSent) {
    return (
      <div className="grid place-content-center h-full">
        A password reset link has been sent to the email address...
      </div>
    );
  }
  return (
    <Layout>
      <FormWrapper title="Forgot Password" alert={alert}>
        <Formik
          initialValues={{
            email: "",
          }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await forgotPassword(values);
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
              <TextInputField
                name="email"
                type="email"
                label="Email:"
                value={values.email}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="email@gmail.com"
              />
              <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting}>
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </FormWrapper>
    </Layout>
  );
}
