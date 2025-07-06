export default function formatXu(number) {
  if (typeof number === "string") {
    number = number.replace(/,/g, "").trim();
  }
  const validNumber = Number(number);
  if (isNaN(validNumber)) {
    return "0";
  }
  const xu = validNumber / 100;
  const roundedXu = Math.ceil(xu / 10);
  return new Intl.NumberFormat("vi-VN").format(roundedXu);
}
