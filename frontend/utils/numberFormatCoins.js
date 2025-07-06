export default function formatXu(number) {
  if (typeof number === "string") {
    number = number.replace(/,/g, "").trim();
  }

  const validNumber = Number(number);
  if (isNaN(validNumber)) {
    return "0";
  }

  const xu = validNumber / 100; // chia đúng 100
  const roundedXu = Math.ceil(xu / 1000) * 1000; // làm tròn lên đến 1.000

  return new Intl.NumberFormat("vi-VN").format(roundedXu);
}
