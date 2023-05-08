export default function turnNumberIntoAudFormat(number: number): string {
  return parseFloat(number.toFixed(2)).toLocaleString("en-AU", {
    style: "currency",
    currency: "AUD",
  });
}
