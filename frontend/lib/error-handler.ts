import { ApiError } from "./api";

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle ApiError with getUserMessage method
  if (error instanceof ApiError) {
    return error.getUserMessage();
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    return String((error as any).message);
  }

  // Default fallback
  return "An unexpected error occurred. Please try again.";
}

/**
 * Maps backend error codes to user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  USER_EXISTS: "An account with this email already exists. Please login instead.",
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  INVALID_TOKEN: "Your session has expired. Please login again.",
  TOKEN_EXPIRED: "Your session has expired. Please login again.",
  INVALID_REFRESH_TOKEN: "Your session has expired. Please login again.",
  
  // Validation errors
  VALIDATION_ERROR: "Please check your input and try again.",
  
  // Database errors
  DATABASE_ERROR: "A database error occurred. Please try again later.",
  DUPLICATE_ENTRY: "This resource already exists.",
  
  // Not found errors
  NOT_FOUND: "The requested resource was not found.",
  USER_NOT_FOUND: "User not found.",
  EVENT_NOT_FOUND: "Event not found.",
  
  // Permission errors
  FORBIDDEN: "You don't have permission to perform this action.",
  UNAUTHORIZED: "Please login to continue.",
  
  // Server errors
  INTERNAL_ERROR: "An internal server error occurred. Please try again later.",
};

/**
 * Gets a user-friendly error message based on the error code
 */
export function getErrorMessageByCode(code?: string): string | undefined {
  if (!code) return undefined;
  return ERROR_MESSAGES[code];
}

/**
 * Handles API errors and returns a user-friendly message
 */
export function handleApiError(error: unknown): string {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    // Try to get a custom message based on error code
    const customMessage = getErrorMessageByCode(error.code);
    if (customMessage) {
      return customMessage;
    }

    // Try to get message from getUserMessage method
    try {
      return error.getUserMessage();
    } catch {
      return error.message;
    }
  }

  return getErrorMessage(error);
}

/**
 * Checks if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  if (error instanceof ApiError && (error.status === 0 || !error.status)) {
    return true;
  }

  return false;
}

/**
 * Checks if an error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return (
      error.status === 401 ||
      error.code === "INVALID_TOKEN" ||
      error.code === "TOKEN_EXPIRED" ||
      error.code === "UNAUTHORIZED"
    );
  }

  return false;
}
