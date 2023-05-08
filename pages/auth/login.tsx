import { useRouter } from "next/router";
import Link from "next/link";
import { Formik } from "formik";
import { signIn } from "next-auth/react";
import * as Yup from "yup";
import FormWrapper from "@/components/FormWrapper";
import TextInputField from "@/components/TextInputField";
import Button from "@/components/Button";
import Layout from "@/components/Layout";
import useAlert from "hooks/useAlert";

export default function LoginForm() {
  const router = useRouter();
  const [alert, setAlert] = useAlert();

  const loginUser = async (values: any) => {
    const res = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: `${window.location.origin}`,
    });
    if (res?.error) {
      setAlert(res?.error);
    } else {
      router.push(`${res?.url}`);
    }
  };

  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("This field is required"),
    password: Yup.string()
      .required("This field is required")
      .min(5, "Please use a longer password"),
  });

  return (
    <Layout>
      <FormWrapper title="Login" alert={alert}>
        <Formik
          initialValues={{
            email: "",
            password: "",
          }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            await loginUser(values);
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
                data-testid="email"
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
                data-testid="password"
              />

              <ul className="flex justify-between text-xs underline italic">
                <li>
                  <Link href="/auth/register">Have&apos;t register?</Link>
                </li>
                <li>
                  <Link href="/auth/forgotPassword">Forgot password?</Link>
                </li>
              </ul>

              <div className="flex justify-center">
                <Button type="submit" disabled={isSubmitting}>
                  Log in
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </FormWrapper>
    </Layout>
  );
}
