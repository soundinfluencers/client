import type { TFilterOption } from "../types/promo-filters-bar.types";

export const FILTER_OPTIONS: TFilterOption[] = [
  { label: 'New Requests', value: 'pending' },
  { label: 'Distributing', value: 'distributing' },
  { label: 'Completed', value: 'completed' },
];