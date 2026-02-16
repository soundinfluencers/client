export const formatDateDDMMYYYY = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);

  const d = digits.slice(0, 2);
  const m = digits.slice(2, 4);
  const y = digits.slice(4, 8);

  let out = d;
  if (m) out += `/${m}`;
  if (y) out += `/${y}`;

  return out;
};