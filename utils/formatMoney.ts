export default function formatMoney(
  amount: number,
  currency: string = "AUD",
  locale: string = "en-AU"
) {
  return parseFloat(amount.toFixed(2)).toLocaleString(locale, {
    style: "currency",
    currency,
  });
}
