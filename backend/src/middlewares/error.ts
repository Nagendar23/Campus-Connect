import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details for debugging
  console.error("=== Error Handler ===");
  console.error("Path:", req.method, req.path);
  console.error("Error:", err);
  console.error("Stack:", err.stack);
  console.error("=====================");

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: err.errors,
      },
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    res.status(409).json({
      error: {
        code: "DUPLICATE_ENTRY",
        message: `${field || 'Resource'} already exists`,
        details: err.keyValue,
      },
    });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid authentication token",
      },
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      error: {
        code: "TOKEN_EXPIRED",
        message: "Authentication token expired",
      },
    });
    return;
  }

  // MongoDB connection errors
  if (err.name === "MongoError" || err.name === "MongoServerError") {
    res.status(503).json({
      error: {
        code: "DATABASE_ERROR",
        message: "Database operation failed",
      },
    });
    return;
  }

  // Default error
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "Internal server error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
