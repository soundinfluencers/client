import type { NestedOption, TreeNodeMeta } from "../types/checkbox-buttons.types";

export const buildTreeMetaMap = (options: NestedOption[]) => {
  const metaMap = new Map<string, TreeNodeMeta>();

  const walk = (nodes: NestedOption[], parentValue: string | null) => {
    nodes.forEach((node) => {
      metaMap.set(node.value, {
        value: node.value,
        parentValue,
      });

      if (node.children?.length) {
        walk(node.children, node.value);
      }
    });
  };

  walk(options, null);

  return metaMap;
};

export const getDescendantValues = (option: NestedOption): string[] => {
  const result: string[] = [];

  const walk = (node: NestedOption) => {
    result.push(node.value);
    node.children?.forEach(walk);
  };

  walk(option);

  return result;
};

export const getAncestorValues = (
  value: string,
  metaMap: Map<string, TreeNodeMeta>,
): string[] => {
  const result: string[] = [];
  let current = metaMap.get(value);

  while (current?.parentValue) {
    result.push(current.parentValue);
    current = metaMap.get(current.parentValue);
  }

  return result;
};

export const findNodeByValue = (
  options: NestedOption[],
  targetValue: string,
): NestedOption | null => {
  for (const option of options) {
    if (option.value === targetValue) return option;

    if (option.children?.length) {
      const nestedResult = findNodeByValue(option.children, targetValue);
      if (nestedResult) return nestedResult;
    }
  }

  return null;
};

export const hasAnySelectedDescendant = (
  value: string,
  selectedSet: Set<string>,
  options: NestedOption[],
) => {
  const node = findNodeByValue(options, value);

  if (!node?.children?.length) return false;

  const descendants = getDescendantValues(node).filter(
    (descendantValue) => descendantValue !== value,
  );

  return descendants.some((descendantValue) => selectedSet.has(descendantValue));
};

export const cleanupAncestors = (
  startValue: string,
  selectedSet: Set<string>,
  metaMap: Map<string, TreeNodeMeta>,
  options: NestedOption[],
) => {
  let current = metaMap.get(startValue);

  while (current?.parentValue) {
    const parentValue = current.parentValue;

    if (!hasAnySelectedDescendant(parentValue, selectedSet, options)) {
      selectedSet.delete(parentValue);
    }

    current = metaMap.get(parentValue);
  }
};

export const getNextSelectedValues = (
  toggledOption: NestedOption,
  selectedValues: string[],
  metaMap: Map<string, TreeNodeMeta>,
  options: NestedOption[],
) => {
  const selectedSet = new Set(selectedValues);
  const isChecked = selectedSet.has(toggledOption.value);

  if (!isChecked) {
    const descendants = getDescendantValues(toggledOption);
    const ancestors = getAncestorValues(toggledOption.value, metaMap);

    [...descendants, ...ancestors].forEach((value) => {
      selectedSet.add(value);
    });

    return Array.from(selectedSet);
  }

  const descendants = getDescendantValues(toggledOption);

  descendants.forEach((value) => {
    selectedSet.delete(value);
  });

  cleanupAncestors(toggledOption.value, selectedSet, metaMap, options);

  return Array.from(selectedSet);
};

export const collectLeafValues = (options: NestedOption[]): Set<string> => {
  const leafValues = new Set<string>();

  const walk = (nodes: NestedOption[]) => {
    nodes.forEach((node) => {
      if (node.children?.length) {
        walk(node.children);
        return;
      }

      leafValues.add(node.value);
    });
  };

  walk(options);

  return leafValues;
};

export const mapSelectedTreeToValues = ({
  selectedValues = [],
  options,
}: {
  selectedValues?: string[];
  options: NestedOption[];
}): string[] => {
  const leafValues = collectLeafValues(options);
  const selectedSet = new Set(selectedValues);

  return Array.from(selectedSet).filter((value) => leafValues.has(value));
};

export const mapValuesToSelectedTree = ({
  values = [],
  options,
}: {
  values?: string[];
  options: NestedOption[];
}): string[] => {
  const selectedSet = new Set<string>();
  const metaMap = buildTreeMetaMap(options);

  values.forEach((value) => {
    selectedSet.add(value);

    getAncestorValues(value, metaMap).forEach((ancestorValue) => {
      selectedSet.add(ancestorValue);
    });
  });

  return Array.from(selectedSet);
};
