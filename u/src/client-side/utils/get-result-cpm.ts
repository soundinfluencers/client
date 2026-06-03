export const getResultCPM = (cpm?: number | null) => {
  const value = Number(cpm ?? 0);

  if (!value || value <= 0) return "";

  if (value < 3) return "Excellent";
  if (value < 5) return "Highly Above Average";
  if (value < 9) return "Above Average";
  if (value < 12) return "Average";

  return "Low Average";
};