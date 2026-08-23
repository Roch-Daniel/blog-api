/**
 * @params value - The string to check if it's numeric.
 */
export const isNumericString = (value: string): boolean => {
  if (!value || value.trim() === "") return false;
  return !isNaN(+value);
};
