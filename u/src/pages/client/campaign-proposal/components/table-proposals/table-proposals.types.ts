export type DropdownKey = "date" | "content" | "description" | null;

export type OpenDropdown = {
  rowIndex: number;
  key: DropdownKey;
} | null;
export type RowSelections = {
  date: string;
  dateValue?: string; // yyyy-mm-dd
  content: string;
  description: string;
};
