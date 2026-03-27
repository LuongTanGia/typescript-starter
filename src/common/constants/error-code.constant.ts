export const ERROR_CODE: Record<string, number> = {
  SUCCESS: 0,

  // Error
  ALL_ERROR: -1,

  // Validation
  VALIDATION_ERROR: -100,

  // System
  INTERNAL_ERROR: -500,
} as const;
