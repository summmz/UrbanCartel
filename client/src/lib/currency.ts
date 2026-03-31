/**
 * USD → INR conversion rate (1 USD ≈ ₹84).
 * Update this constant to adjust the exchange rate site-wide.
 */
const USD_TO_INR = 84;

/**
 * Converts a USD price to INR and formats it with the ₹ symbol
 * using Indian number formatting (e.g. ₹2,51,916.00).
 *
 * @param value   - price in USD as number or numeric string
 * @param decimals - decimal places (default 2)
 */
export function formatPrice(value: number | string, decimals = 2): string {
  const usd = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(usd)) return "₹0.00";
  const inr = usd * USD_TO_INR;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(inr);
}
