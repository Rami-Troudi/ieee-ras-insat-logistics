import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { MobileEntityCard } from "./MobileEntityCard";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface ResponsiveDataTableProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  columns: DataTableColumn<T>[];
  renderMobileCard?: (item: T) => React.ReactNode;
  emptyState?: React.ReactNode;
  className?: string;
}

export function ResponsiveDataTable<T>({
  data,
  keyExtractor,
  columns,
  renderMobileCard,
  emptyState,
  className,
}: ResponsiveDataTableProps<T>) {
  const isDesktop = useIsDesktop();

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  if (isDesktop) {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-card overflow-hidden shadow-sm",
          className
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={col.headerClassName}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Mobile card view
  return (
    <div className={cn("space-y-3", className)}>
      {data.map((item) => {
        if (renderMobileCard) {
          return <React.Fragment key={keyExtractor(item)}>{renderMobileCard(item)}</React.Fragment>;
        }

        // Default fallback using first column as title, others as metadata
        const [firstCol, ...otherCols] = columns;
        return (
          <MobileEntityCard
            key={keyExtractor(item)}
            title={firstCol ? firstCol.render(item) : "Item"}
            metadata={otherCols.map((c) => ({
              label: c.header,
              value: c.render(item),
            }))}
          />
        );
      })}
    </div>
  );
}
