export default function numberFormat(number) {
  if (typeof number === "string") {
    // Loại bỏ dấu phẩy và khoảng trắng nếu có
    number = number.replace(/,/g, "").trim();
  }

  const validNumber = Number(number);

  if (isNaN(validNumber)) {
    console.warn("Invalid number:", number);
    return "N/A";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(validNumber)
    .replace(/\s?₫/, "₫");
}
