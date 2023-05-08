import { useRouter } from "next/router";
import { Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import FormWrapper from "@/components/FormWrapper";
import TextInputField from "@/components/TextInputField";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import useAlert from "hooks/useAlert";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [alert, setAlert] = useAlert();

  const resetPassword = async (values: any) => {
    await axios
      .post("/api/auth/resetPassword", {
        email: router.query.email,
        password: values.password,
        token: router.query.token,
      })
      .then(() => router.push("/auth/login"))
      .catch((error: any) => {
        setAlert(error.response.data.msg);
      });
  };

  const RegisterSchema = Yup.object().shape({
    password: Yup.string()
      .required("This field is required")
      .min(5, "Please use a longer password"),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), undefined],
        'Must match "password" field value'
      )
      .required("Confirm Password is required"),
  });

  return (
    <Layout>
      <FormWrapper title="Reset Password" alert={alert}>
        <Formik
          initialValues={{
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await resetPassword(values);
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
                name="password"
                type="password"
                label="Password:"
                value={values.password}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Password"
              />

              <TextInputField
                name="confirmPassword"
                label="Confirm Password:"
                type="password"
                value={values.confirmPassword}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                placeholder="Confirm Password"
              />
              <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting}>
                  Reset Password
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </FormWrapper>
    </Layout>
  );
}
