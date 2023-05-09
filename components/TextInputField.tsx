type TextInputFieldProps = {
  type: string;
  name: string;
  label: string;
  value: string;
  errors: { [key: string]: string };
  touched: { [key: string]: boolean };
  // eslint-disable-next-line unused-imports/no-unused-vars
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // eslint-disable-next-line unused-imports/no-unused-vars
  handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

export default function TextInputField({
  type,
  name,
  label,
  value,
  errors,
  touched,
  handleChange,
  handleBlur,
  ...props
}: TextInputFieldProps) {
  return (
    <div className="mb-6 flex  items-baseline gap-6 relative">
      <label htmlFor={name} className="basis-1/2">
        {label}{" "}
      </label>
      <input
        className="px-1 py-1 rounded-sm focus:outline-none basis-1/2"
        type={type}
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        value={value}
        {...props}
      />
      <span className="absolute top-8 text-xs right-0">
        {errors[name] && touched[name] && errors[name]}
      </span>
    </div>
  );
}
