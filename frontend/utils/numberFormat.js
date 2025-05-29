export default function numberFormat(number) {
  if (typeof number === "string") {
    number = number.replace(/,/g, "").trim();
  }
  const validNumber = Number(number);
  if (isNaN(validNumber)) {
    return "N/A";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(validNumber)
    .replace(/\s?₫/, "₫");
}
