export const NUMERIC_FIELD_RULES = {
  tel: { length: 9, startsWith: "9", message: "El teléfono debe tener 9 dígitos y empezar en 9" },
  ruc: { length: 11, startsWith: null, message: "El RUC debe tener 11 dígitos" },
} as const;

export type NumericFieldType = keyof typeof NUMERIC_FIELD_RULES;

export function isNumericField(type: string): type is NumericFieldType {
  return type === "tel" || type === "ruc";
}

export function sanitizeNumeric(value: string, type: NumericFieldType): string {
  return value.replace(/\D/g, "").slice(0, NUMERIC_FIELD_RULES[type].length);
}

export function isNumericValid(value: string, type: NumericFieldType): boolean {
  const rule = NUMERIC_FIELD_RULES[type];
  if (value.length !== rule.length) return false;
  if (rule.startsWith && !value.startsWith(rule.startsWith)) return false;
  return true;
}
