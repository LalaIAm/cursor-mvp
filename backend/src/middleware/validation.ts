import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

/**
 * Validation middleware factory
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: {
            code: "validation_error",
            message: "Validation failed",
            details: errors,
          },
        });
      } else {
        next(error);
      }
    }
  };
};
