import React, { ReactNode } from "react";
import { BusinessDetails } from "services/repository/Repository.ts";
import Navbar from "./Navbar";

export default function Layout(props: {
  children: ReactNode;
  businessDetails?: BusinessDetails;
}) {
  return (
    <div className="flex flex-col h-full">
      <Navbar businessDetails={props.businessDetails} />
      <main className=" flex-grow">{props.children}</main>
    </div>
  );
}
