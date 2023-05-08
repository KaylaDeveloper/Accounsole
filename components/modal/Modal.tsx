import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function Modal({
  isModalOpen,
  closeModal,
  children,
  error = "",
  title,
  subTitle = "",
}: {
  isModalOpen: boolean;
  closeModal: () => void;
  children: React.ReactNode;
  error?: string;
  title: string;
  subTitle?: string;
}) {
  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all relative">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center"
                >
                  {title}
                  <div className="text-sm absolute text-center w-full -ml-6">
                    {error}
                  </div>
                </Dialog.Title>
                <Dialog.Title
                  as="h3"
                  className="text-md font-normal leading-6 text-gray-900 text-center"
                >
                  {subTitle}
                </Dialog.Title>
                {children}
                <button
                  type="button"
                  className="absolute right-2 top-2 grid place-center rounded-md border border-transparent bg-primary-color font-medium text-blue-900 hover:bg-dark-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={closeModal}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
