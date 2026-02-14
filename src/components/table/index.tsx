import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
} from "@heroui/react";
import { cn } from "../../utils/helper";

interface Column {
  key: string;
  label: string;
}

interface GenericTableProps<T> {
  columns: Column[];
  items: T[];
  loading: boolean;
  renderCell: (item: T, columnKey: React.Key, index: number) => React.ReactNode;
  containerClassName?: string;
}

export const GenericTable = <T extends { id: string | number }>({
  columns,
  items = [],
  loading,
  renderCell,
  containerClassName,
}: GenericTableProps<T>) => {
  const allColumns = [{ key: "sno", label: "S No." }, ...columns];

  return (
    <div
      className={cn(
        "size-full rounded-2xl shadow-md border border-gray-100 overflow-hidden font-sans flex flex-col",
        containerClassName,
      )}
    >
      <Table
        aria-label="Customer Data Table"
        removeWrapper
        isHeaderSticky
        classNames={{
          base: "flex-1 overflow-auto scrollbar-hide",
          // Changed h-full to h-auto so rows don't stretch vertically
          table: "min-w-full border-separate border-spacing-0 h-auto",
          thead: "z-10",
          th: [
            "bg-indigo-50",
            "text-indigo-600",
            "font-bold",
            "text-[12px]",
            "uppercase",
            "tracking-tight",
            "py-2.5", // Reduced header height
            "px-6",
            "border-b",
            "border-indigo-100",
          ],
          td: [
            "py-2", // This makes the row height small/fit to content
            "px-6",
            "border-b",
            "border-indigo-50",
            "group-data-[hover=true]:bg-indigo-100/30",
            "transition-colors",
          ],
        }}
      >
        <TableHeader columns={allColumns}>
          {(column) => (
            <TableColumn
              key={column.key}
              className={cn(
                column.key === "sno" && "pl-8 w-[60px]",
                column.key === "actions" &&
                  "sticky right-0 z-10 bg-indigo-50 font-bold pr-8 text-center",
              )}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={items}
          loadingContent={
            <div className="flex items-center justify-center absolute inset-0 bg-white/50 z-10">
              <Spinner color="primary" label="Loading data..." />
            </div>
          }
          isLoading={loading}
          emptyContent={
            <div className="flex items-center justify-center absolute inset-0 text-slate-400 font-medium">
              No records found.
            </div>
          }
        >
          {(item) => {
            const index = items.indexOf(item);
            return (
              <TableRow key={item.id} className="group">
                {(columnKey) => (
                  <TableCell
                    className={cn(
                      "text-slate-600 text-sm h-14 font-semibold",
                      columnKey === "sno" && "pl-8 font-bold",
                      columnKey === "actions" &&
                        "sticky right-0 z-10 bg-indigo-50 text-white pr-8 group-data-[hover=true]:bg-indigo-600 transition-colors text-center",
                    )}
                  >
                    {columnKey === "sno"
                      ? `${index + 1})`
                      : renderCell(item, columnKey, index)}
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>
    </div>
  );
};
