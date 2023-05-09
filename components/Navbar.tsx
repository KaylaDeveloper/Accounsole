import Link from "next/link";
import { Menu } from "@headlessui/react";
import { signOut } from "next-auth/react";
import { BusinessDetails } from "services/repository/Repository";

export default function Navbar(props: { businessDetails?: BusinessDetails }) {
  if (!props.businessDetails) {
    return (
      <header className="flex justify-between items-baseline bg-primary-color px-6 py-3 leading-10">
        <div className="flex items-baseline gap-4">
          <p className="text-xl font-bold">Accounsole </p>
          <p className="hidden sm:block">Accounting system for sole traders</p>
        </div>
        <ul className="flex gap-6">
          <li>
            <Link href="/auth/register">Register</Link>
          </li>
          <li>
            <Link href="/auth/login">Login</Link>
          </li>
        </ul>
      </header>
    );
  }

  return (
    <section>
      <header className="flex bg-primary-color px-6 py-1 leading-10 justify-between">
        <Link href="/" className="font-semibold">
          {props.businessDetails.business_name}
        </Link>
        <nav>
          <ul className="flex gap-6">
            <li className="hidden sm:inline-block">
              <Link href="/">Home</Link>
            </li>
            <li className="hidden sm:inline-block">
              <Link href="/bank">Bank</Link>
            </li>
            <li className="hidden sm:inline-block">
              <Link href="/manualEntries">Manual Entries</Link>
            </li>
            <li className="hidden sm:inline-block">
              <Menu>
                <Menu.Button>Reports</Menu.Button>
                <Menu.Items className="flex flex-col absolute -ml-10 border-2 mt-1 bg-primary-color rounded-sm z-10 ">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        className={`${active && "bg-dark-blue"} px-2`}
                        href="/reports/trial-balance"
                      >
                        Trial Balance
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        className={`${active && "bg-dark-blue"} px-2`}
                        href="/reports/balance-sheet"
                      >
                        Balance Sheet
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        className={`${active && "bg-dark-blue"} px-2`}
                        href="/reports/income-statement"
                      >
                        Income Statement
                      </Link>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>
            </li>
            <li>
              <Link href="/settings" className="hidden sm:inline-block">
                Settings
              </Link>
            </li>
            <li>
              <button onClick={() => signOut({ callbackUrl: "/" })}>
                Sign out
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <header className="flex bg-primary-color px-6 py-1 leading-6 justify-center border-t sm:hidden">
        <ul className="flex gap-4 ">
          <li>
            <Link href="/bank">Bank</Link>
          </li>
          <li>
            <Link href="/manualEntries">Manual Entries</Link>
          </li>
          <li>
            <Menu>
              <Menu.Button>Reports</Menu.Button>
              <Menu.Items className="flex flex-col absolute -ml-10 border-2 mt-1 bg-primary-color rounded-sm z-10 ">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={`${active && "bg-dark-blue"} px-2`}
                      href="/reports/trial-balance"
                    >
                      Trial Balance
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={`${active && "bg-dark-blue"} px-2`}
                      href="/reports/balance-sheet"
                    >
                      Balance Sheet
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      className={`${active && "bg-dark-blue"} px-2`}
                      href="/reports/income-statement"
                    >
                      Income Statement
                    </Link>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </li>
          <li>
            <Link href="/settings">Settings</Link>
          </li>
        </ul>
      </header>
    </section>
  );
}
