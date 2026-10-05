// "99999 99999" -> "919999999999" (assumes India if 10 digits)
export const normalizePhone = (input: string): string => {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
};