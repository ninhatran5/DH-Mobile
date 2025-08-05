export function formatNumberInput(raw) {
  if (raw === "" || raw == null) return "";
  const cleaned = String(raw).replace(/,/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function sanitizeNumberInput(value) {
  const raw = value.replace(/,/g, "");
  return raw
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1")
    .replace(/^(\d+)\.(\d{0,2}).*$/, (_, int, dec) => `${int}.${dec}`);
}