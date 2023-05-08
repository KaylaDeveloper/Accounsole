import { createContext, useContext } from "react";
import { HeaderRendererProps, useFocusRef } from "react-data-grid";

export default function useFilter(Filter: any) {
  const FilterContext = createContext<typeof Filter | undefined>(undefined);
  const inputStopPropagation = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.stopPropagation();
    }
  };
  const selectStopPropagation = (
    event: React.KeyboardEvent<HTMLSelectElement>
  ) => {
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      event.stopPropagation();
    }
  };
  const FilterRenderer = <R, SR, T extends HTMLOrSVGElement>({
    isCellSelected,
    column,
    children,
  }: HeaderRendererProps<R, SR> & {
    // eslint-disable-next-line unused-imports/no-unused-vars
    children: (args: {
      ref: React.RefObject<T>;
      tabIndex: number;
      filters: typeof Filter;
    }) => React.ReactElement;
  }) => {
    const filters = useContext(FilterContext)!;
    const { ref, tabIndex } = useFocusRef<T>(isCellSelected);

    return (
      <>
        <div className="leading-8">{column.name}</div>
        <div className="leading-8">{children({ ref, tabIndex, filters })}</div>
      </>
    );
  };

  return {
    FilterContext,
    inputStopPropagation,
    selectStopPropagation,
    FilterRenderer,
  };
}
