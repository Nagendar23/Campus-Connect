import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : null;

    if (!token) {
      console.log('Authentication failed - No token provided');
      console.log('Authorization header:', header ? `Present (${header.substring(0, 20)}...)` : 'Missing');
      console.log('Request path:', req.path);
      console.log('Request method:', req.method);
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Missing authentication token. Please log in again.",
          details: "No bearer token found in authorization header"
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);
    (req as AuthRequest).user = payload;
    next();
  } catch (error) {
    console.log('Authentication failed - Invalid token');
    console.log('Error:', error instanceof Error ? error.message : error);
    res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired authentication token. Please log in again.",
        details: error instanceof Error ? error.message : "Token verification failed"
      },
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;

    if (!user) {
      res.status(401).json({
        error: {
          code: "UNAUTHENTICATED",
          message: "Authentication required",
        },
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      });
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (token) {
      const payload = verifyAccessToken(token);
      (req as AuthRequest).user = payload;
    }
  } catch {
    // Ignore errors for optional auth
  }
  next();
}
