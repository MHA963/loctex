/**
 * Contract & Schema Invariant Validator
 * Validates payload structures against expected contracts.
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredKeys: (keyof T)[]
): ValidationResult<T> {
  const errors: string[] = [];

  for (const key of requiredKeys) {
    if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
      errors.push(`Missing required invariant field: String(${String(key)})`);
    }
  }

  return {
    success: errors.length === 0,
    data: errors.length === 0 ? obj : undefined,
    errors
  };
}

export function validateIdempotencyKey(key: unknown): boolean {
  if (typeof key !== 'string' || key.trim().length === 0) return false;
  // UUID v4 format check
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(key) || key.startsWith('idemp_');
}
