import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center h-screen bg-gray-100 pt-40">
      <h1 className="text-4xl font-bold mb-6">Access Denied</h1>
      <p className="text-gray-600 text-center mb-8">
        Sorry, you do not have permission to access this page.
      </p>
      <Link
        href="/"
        className="bg-primary-color hover:bg-dark-blue font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Back to Home
      </Link>
    </div>
  );
}
