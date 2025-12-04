/**
 * API configuration constants
 * Centralized configuration for all API endpoints
 */

// Base URL configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Validation for required environment variables
if (typeof window !== 'undefined' && !API_BASE_URL) {
  console.error('NEXT_PUBLIC_API_URL is not defined in environment variables');
}

// API versioning
export const API_VERSION = 'v1';

// Request timeout (in milliseconds)
export const API_TIMEOUT = 30000;

// Retry configuration for failed requests
export const API_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;

/**
 * Authentication API endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REGISTER_INITIAL: '/auth/register-initial',
  REGISTER_COMPLETE: '/auth/register-complete',
  SESSION: '/auth/session/user',
  REQUEST_SUPPLIER: '/auth/request-supplier',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

/**
 * Admin management API endpoints
 */
export const ADMIN_ENDPOINTS = {
  ADMINS: '/admin/management/admins',
  ADMIN_BY_ID: (adminId: string) => `/admin/management/admins/${adminId}`,
  ADMIN_PERMISSIONS: (adminId: string) => `/admin/management/admins/${adminId}/permissions`,
  ADMIN_STATS: '/admin/management/stats',
  ADMIN_LOGS: '/admin/management/logs',
} as const;


/**
 * User management API endpoints
 */
export const CUSTOMER_ENDPOINTS = {
  PROFILE: '/customer/profile',
  PROFILE_UPDATE: '/customer/profile',
  AVATAR_UPLOAD: '/customer/avatar',
  PREFERENCES: '/customer/preferences',
} as const;

/**
 * Supplier management API endpoints
 */
export const SUPPLIER_ENDPOINTS = {
  SUPPLIERS: '/suppliers',
  SUPPLIER_BY_ID: (id: string) => `/suppliers/${id}`,
  SUPPLIER_DOCUMENTS: (id: string) => `/suppliers/${id}/documents`,
  SUPPLIER_VERIFICATION: (id: string) => `/suppliers/${id}/verify`,
} as const;

/**
 * Builds complete URL for API requests
 * @param endpoint - API endpoint path
 * @returns Full URL string
 */
export const buildApiUrl = (endpoint: string): string => {
  if (!API_BASE_URL) throw new Error('API base URL is not configured');

  // Remove leading/trailing slashes for consistency
  const base = API_BASE_URL.replace(/\/$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${base}${path}`;
};

/**
 * Content-Type constants
 */
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  FORM_URLENCODED: 'application/x-www-form-urlencoded',
} as const;

/**
 * HTTP methods constants
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * API cache configuration
 */
export const CACHE_CONFIG = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 3600,       // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;