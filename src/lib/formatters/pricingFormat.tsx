export const pricingFormat = (price: number | string): string => {
  const numPrice = Number(price);
  return `₱${numPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};
