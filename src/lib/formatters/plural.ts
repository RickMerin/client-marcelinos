// Pluralize words if value is > 1
export const pluralize = (value: number, word: string) => {
  return value > 1 ? word + "s" : word;
};
