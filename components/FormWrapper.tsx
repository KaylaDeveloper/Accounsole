import { ReactNode } from "react";

export default function FormWrapper(props: {
  alert: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="grid place-content-center h-full px-4">
      <div className="bg-light-blue px-6 py-10 shadow-lg rounded-md relative">
        <h1 className="capitalize text-2xl bold text-center mb-10">
          {props.title}
        </h1>
        <p className="text-md rounded absolute top-20">{props.alert}</p>
        {props.children}
      </div>
    </div>
  );
}
