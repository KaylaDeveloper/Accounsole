import React from "react";
import {
  Column,
  FormatterProps,
  HeaderRendererProps,
  SelectCellFormatter,
  useRowSelection,
} from "react-data-grid";

import "react-data-grid/lib/styles.css";

import { TransactionRow } from "@/pages/bank/[bankAccount]";

const SELECT_COLUMN_KEY = "select-row";

function HeaderRenderer(props: HeaderRendererProps<unknown>) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select All"
      isCellSelected={props.isCellSelected}
      value={isRowSelected}
      onChange={(checked) => {
        onRowSelectionChange({ type: "HEADER", checked });
      }}
    />
  );
}

function SelectFormatter(props: FormatterProps<unknown>) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  if (
    (props.row as TransactionRow).split ||
    (props.row as TransactionRow).parentId
  ) {
    return null;
  }

  return (
    <SelectCellFormatter
      aria-label="Select"
      isCellSelected={props.isCellSelected}
      value={isRowSelected}
      onChange={(checked, isShiftClick) => {
        onRowSelectionChange({
          type: "ROW",
          row: props.row,
          checked,
          isShiftClick,
        });
      }}
    />
  );
}

const SelectColumn: Column<any, any> = {
  key: SELECT_COLUMN_KEY,
  name: "",
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  headerRenderer: (props) => <HeaderRenderer {...props} />,
  formatter: (props) => <SelectFormatter {...props} />,
};

export default SelectColumn;
