import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';

/**
 * Middleware genérico de validación de DTOs con Zod.
 * Sanitiza `req.body` en la frontera del sistema; si falla, responde 400
 * sin llegar a tocar los Casos de Uso.
 */
export const validateRequest =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'fail',
          code: 'VALIDATION_ERROR',
          message: 'Error de validación en los datos de entrada',
          errors: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
