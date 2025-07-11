export function numberFormatRanks(value) {
  if (value == null || isNaN(value)) return "0";
  return value.toLocaleString("vi-VN");
}
