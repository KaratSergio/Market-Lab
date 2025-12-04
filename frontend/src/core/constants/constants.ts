/**
 * Validation rules and regex patterns
 */

// Password validation
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  MAX_LENGTH: 128,
  PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  MESSAGES: {
    MIN_LENGTH: 'Password must be at least 8 characters long',
    MAX_LENGTH: 'Password cannot exceed 128 characters',
    PATTERN: 'Password must contain uppercase, lowercase, number and special character',
  },
} as const;

// Email validation
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const EMAIL_MAX_LENGTH = 254;

// Phone number validation (international format)
export const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

// Username validation
export const USERNAME_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  PATTERN: /^[a-zA-Z0-9_]+$/,
  MESSAGES: {
    MIN_LENGTH: 'Username must be at least 3 characters',
    MAX_LENGTH: 'Username cannot exceed 30 characters',
    PATTERN: 'Username can only contain letters, numbers and underscores',
  },
} as const;

// Company name validation
export const COMPANY_NAME_RULES = {
  MIN_LENGTH: 2,
  MAX_LENGTH: 100,
  PATTERN: /^[a-zA-Z0-9\s&'\-.,]+$/,
} as const;

// Tax ID/VAT validation patterns
export const TAX_ID_PATTERNS = {
  US_EIN: /^\d{2}-\d{7}$/,
  EU_VAT: /^[A-Z]{2}[A-Z0-9]{2,12}$/,
  GENERIC: /^[A-Z0-9]{5,20}$/,
} as const;

// URL validation
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Currency validation
export const CURRENCY_PATTERNS = {
  USD: /^\$?(\d{1,3}(,\d{3})*|(\d+))(\.\d{2})?$/,
  EUR: /^€?(\d{1,3}(\.\d{3})*|(\d+))(,\d{2})?$/,
  GENERIC: /^[+-]?[0-9]{1,3}(?:[0-9]*(?:[.,][0-9]{2})?|(?:,[0-9]{3})*(?:\.[0-9]{2})?|(?:\.[0-9]{3})*(?:,[0-9]{2})?)$/,
} as const;

// File validation
export const FILE_VALIDATION = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  ALLOWED_DOC_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
} as const;

// Address validation
export const ADDRESS_RULES = {
  ZIP_CODE: {
    US: /^\d{5}(-\d{4})?$/,
    EU: /^[A-Z0-9]{3,10}$/,
  },
  COUNTRY_CODES: ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'PL', 'UA'] as const,
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_URL: 'Please enter a valid URL',
  FILE_TOO_LARGE: (maxSize: number) => `File size must be less than ${maxSize}MB`,
  INVALID_FILE_TYPE: 'File type is not allowed',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Cannot exceed ${max} characters`,
  PATTERN_MISMATCH: 'Invalid format',
  MISMATCH: 'Values do not match',
  INVALID_DATE: 'Please enter a valid date',
  DATE_IN_PAST: 'Date cannot be in the past',
  DATE_IN_FUTURE: 'Date cannot be in the future',
} as const;

// Business validation rules
export const BUSINESS_RULES = {
  MINIMUM_ORDER_AMOUNT: 10.0,
  MAXIMUM_ORDER_AMOUNT: 10000.0,
  SUPPLIER_COMMISSION_RATE: 0.15, // 15%
  TAX_RATE: 0.23, // 23% VAT
  CURRENCY: 'USD',
  DECIMAL_PLACES: 2,
} as const;