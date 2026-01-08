export interface TableColumn {
  key: string;
  title: string;
  render?: (row: any, index: number) => React.ReactNode;
}

export type TableVariant = 'default' | 'bordered' | 'striped';

export interface TableProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: TableColumn[];
  data: any[];
  variant?: TableVariant;
  hover?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  className?: string;
  children?: React.ReactNode;
}
