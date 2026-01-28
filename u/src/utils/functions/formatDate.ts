export const formatCampaignDate = (
  value?: string | Date,
  locale: string = "en-US",
) => {
  if (!value) return "—";

  let date: Date | null = null;

  if (value instanceof Date) {
    date = value;
  }

  if (typeof value === "string") {
    if (/^\d{2}\.\d{2}\.\d{2}$/.test(value)) {
      const [day, month, yearShort] = value.split(".");
      date = new Date(Number(yearShort) + 2000, Number(month) - 1, Number(day));
    } else {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
  }

  if (!date) return "—";

  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
