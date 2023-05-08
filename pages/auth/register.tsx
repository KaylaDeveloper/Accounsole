import { signIn } from "next-auth/react";
import { Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import FormWrapper from "@/components/FormWrapper";
import TextInputField from "@/components/TextInputField";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import useAlert from "hooks/useAlert";

export type Values = {
  email: "" | string;
  password: "" | string;
};
export default function LoginForm() {
  const [alert, setAlert] = useAlert();

  const registerUser = async (values: Values) => {
    await axios
      .post("/api/auth/register", {
        email: values.email,
        password: values.password,
      })
      .then(() =>
        signIn("credentials", {
          redirect: true,
          email: values.email,
          password: values.password,
          callbackUrl: `${window.location.origin}`,
        })
      )
      .catch((error: any) => {
        setAlert(error.response.data.msg);
      });
  };

  const RegisterSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(5, "Please use a longer password"),
    confirmPassword: Yup.string()
      .oneOf(
        [Yup.ref("password"), undefined],
        'Must match "password" field value'
      )
      .required("Confirm password is required"),
  });

  return (
    <Layout>
      <FormWrapper title="Register" alert={alert}>
        <Formik
          initialValues={{
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await registerUser(values);
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
                  Register
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </FormWrapper>
    </Layout>
  );
}
