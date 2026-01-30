export type DropdownKey = "date" | "content" | "description";
export type TableView = "main" | "music" | "press";
export type RowSelections = {
  date: string;
  dateValue?: string;
  content: string;
  description: string;
};

export type OpenDropdown = {
  rowIndex: number;
  key: DropdownKey;
} | null;
