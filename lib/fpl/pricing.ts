export function computeSellingPrice(
  transferInPrice: number,
  currentPrice: number
): number {
  const diff = currentPrice - transferInPrice;
  if (diff > 0) {
    return transferInPrice + Math.floor(diff / 2);
  }
  return currentPrice;
}
