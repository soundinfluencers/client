export type Column<T> = {
  key: string;
  title: React.ReactNode;
  render?: (row: T) => React.ReactNode;
};

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;

  footer?: React.ReactNode;
  addAction?: React.ReactNode;
}

export type PlatformForm = {
  items: Record<string, string>[];
  postDescription?: string[];
};
