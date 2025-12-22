export type AndOrMethod = "And" | "Or";

export interface AndOrOption {
  method: string;
}

export interface FilterItem {
  id: string;
  filterName: string;
  count: number;
  children?: FilterItem[];
}

export interface FilterData {
  id: string;
  title: string;
  AndOrFlag?: AndOrOption[];
  filters: FilterItem[];
}
