export default function numberFormat(number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(number || 0)
    .replace(/\s?₫/, "₫");
}
