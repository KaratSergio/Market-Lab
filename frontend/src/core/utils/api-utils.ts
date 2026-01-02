import {
  API_TIMEOUT,
  API_RETRY_CONFIG,
  CONTENT_TYPES,
  HTTP_STATUS,
  buildApiUrl,
} from '../constants/api-config';

/**
 * Custom API error with additional context
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: unknown,
    public timestamp: Date = new Date()
  ) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Check if error is due to authentication failure
   */
  isAuthError(): boolean {
    return this.status === HTTP_STATUS.UNAUTHORIZED ||
      this.status === HTTP_STATUS.FORBIDDEN;
  }

  /**
   * Check if error is due to client validation
   */
  isValidationError(): boolean {
    return this.status === HTTP_STATUS.BAD_REQUEST ||
      this.status === HTTP_STATUS.UNPROCESSABLE_ENTITY;
  }

  /**
   * Check if error should trigger a retry
   */
  isRetryable(): boolean {
    return API_RETRY_CONFIG.retryStatusCodes.some(code => code === this.status) ||
      this.message.includes('timeout') ||
      this.message.includes('network');
  }
}

/**
 * Standardized API response handler
 */
export const handleApiResponse = async <T>(
  response: Response,
  options?: {
    parseJson?: boolean;
    customErrorHandler?: (error: ApiError) => void;
  }
): Promise<T> => {
  const parseJson = options?.parseJson ?? true;
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes(CONTENT_TYPES.JSON);

  if (!response.ok) {
    let errorData: any;
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      if (isJson) {
        errorData = await response.json();
        errorMessage = errorData.message ||
          errorData.error ||
          errorMessage;
      } else {
        errorData = await response.text();
      }
    } catch {
      errorData = null;
    }

    const error = new ApiError(
      response.status,
      errorMessage,
      errorData?.code,
      errorData?.details || errorData
    );

    // Execute custom error handler if provided
    options?.customErrorHandler?.(error);
    throw error;
  }

  // Handle no-content responses
  if (response.status === HTTP_STATUS.NO_CONTENT ||
    response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  // Parse response based on content type
  if (parseJson && isJson) {
    return response.json() as Promise<T>;
  }

  return response.text() as Promise<T>;
};

/**
 * Builds headers for API requests
 */
export const buildHeaders = (
  options: {
    contentType?: 'json' | 'form-data' | 'text';
    token?: string;
    additionalHeaders?: Record<string, string>;
  } = {}
): HeadersInit => {
  const headers: HeadersInit = {};

  // Set Content-Type
  switch (options.contentType) {
    case 'json':
      headers['Content-Type'] = CONTENT_TYPES.JSON;
      break;
    case 'form-data':
      // Don't set Content-Type for FormData (browser will set it with boundary)
      break;
    case 'text':
      headers['Content-Type'] = 'text/plain';
      break;
    default:
      headers['Content-Type'] = CONTENT_TYPES.JSON;
  }

  // Set Authorization header
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  // Add additional headers
  if (options.additionalHeaders) {
    Object.entries(options.additionalHeaders).forEach(([key, value]) => {
      headers[key] = value;
    });
  }

  return headers;
};

/**
 * Creates a timeout promise for fetch requests
 */
const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new ApiError(408, `Request timeout after ${timeout}ms`, 'TIMEOUT'));
    }, timeout);
  });
};

/**
 * Retry mechanism for failed requests
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = API_RETRY_CONFIG.maxRetries,
  retryDelay: number = API_RETRY_CONFIG.retryDelay
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const shouldRetry = error instanceof ApiError && error.isRetryable();

      if (isLastAttempt || !shouldRetry) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = retryDelay * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 100;

      await new Promise(resolve => setTimeout(resolve, delay + jitter));

      console.warn(`Retrying API request (attempt ${attempt}/${maxRetries})`);
    }
  }

  throw new ApiError(500, 'Max retries exceeded');
};

/**
 * Generic fetch wrapper with timeout, retry, and error handling
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
  config?: {
    token?: string;
    timeout?: number;
    retry?: boolean;
    parseJson?: boolean;
    customErrorHandler?: (error: ApiError) => void;
  }
): Promise<T> => {
  const {
    token,
    timeout = API_TIMEOUT,
    retry = true,
    parseJson = true,
    customErrorHandler,
  } = config || {};

  // Determine content type from request body
  const contentType = options.body instanceof FormData ? 'form-data' : 'json';

  const headers = buildHeaders({
    contentType,
    token,
    additionalHeaders: options.headers as Record<string, string>,
  });

  const fetchOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  const url = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);

  const executeRequest = async (): Promise<T> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await handleApiResponse<T>(response, {
        parseJson,
        customErrorHandler
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(408, `Request timeout after ${timeout}ms`, 'TIMEOUT');
      }

      throw error;
    }
  };

  return retry ? withRetry(executeRequest) : executeRequest();
};

/**
 * Creates FormData for supplier registration with correct structure
 */
export const createSupplierFormData = (
  profileData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    companyName: string;
    description: string;
    registrationNumber: string;
  },
  files: File[] = []
): FormData => {
  const formData = new FormData();

  // Role
  formData.append('role', 'supplier');

  // Profile fields
  formData.append('profile[firstName]', profileData.firstName);
  formData.append('profile[lastName]', profileData.lastName);
  formData.append('profile[phone]', profileData.phone);
  formData.append('profile[address]', profileData.address);
  formData.append('profile[companyName]', profileData.companyName);
  formData.append('profile[description]', profileData.description);
  formData.append('profile[registrationNumber]', profileData.registrationNumber);

  // Files
  files.forEach(file => formData.append('documents', file));

  return formData;
};

/**
 * Utility to log API requests for debugging
 */
export const logApiRequest = (
  method: string,
  url: string,
  options?: RequestInit,
  response?: any
): void => {
  if (process.env.NODE_ENV === 'development') {
    console.groupCollapsed(`📡 API ${method} ${url}`);
    console.log('Options:', options);
    if (response) {
      console.log('Response:', response);
    }
    console.groupEnd();
  }
};