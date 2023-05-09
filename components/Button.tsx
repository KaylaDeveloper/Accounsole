export default function Button({
  type,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className="shadow-lg capitalize bg-dark-blue hover:bg-primary-color py-2 px-4 rounded-md mt-6 mb-6"
      {...props}
    >
      {children}
    </button>
  );
}
