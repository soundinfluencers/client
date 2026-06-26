export type NestedOption = {
  label: string;
  value: string;
  children?: NestedOption[];
};

export type TreeNodeMeta = {
  value: string;
  parentValue: string | null;
};
