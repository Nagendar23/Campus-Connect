import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Format error messages in a more user-friendly way
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: formattedErrors,
          },
        });
        return;
      }
      next(error);
    }
  };
}

// Common validation schemas
export const schemas = {
  email: z.string().email(),
  password: z.string().min(6),
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  pagination: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
};
