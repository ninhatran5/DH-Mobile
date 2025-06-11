export default function numberFormat(number) {
  if (typeof number === "string") {
    number = number.replace(/,/g, "").trim();
  }
  const validNumber = Number(number);
  if (isNaN(validNumber)) {
    return "0₫";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(validNumber)
    .replace(/\s?₫/, "₫");
}
