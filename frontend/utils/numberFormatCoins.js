export default function formatXu(number) {
  if (typeof number === "string") {
    number = number.replace(/,/g, "").trim();
  }

  const validNumber = Number(number);
  if (isNaN(validNumber)) {
    return "0";
  }

  const roundedXu = Math.ceil(validNumber / 1000) * 1000;

  return new Intl.NumberFormat("vi-VN").format(roundedXu);
}
