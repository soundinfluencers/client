export const hasDisplayValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  return typeof value !== "string" || value.trim() !== "";
};
