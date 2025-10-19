export const pricingFormat = (price: number): string => {
  return `₱${price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,")}`;
};
