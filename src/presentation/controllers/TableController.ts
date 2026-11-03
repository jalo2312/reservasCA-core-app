import type { NextFunction, Request, Response } from 'express';
import type { ListTablesUseCase } from '../../use-cases/ListTablesUseCase.js';

/**
 * Adaptador de entrada HTTP para el catálogo de mesas predefinidas.
 * Las mesas no se crean, eliminan ni cambian de estado vía API; su estado lo
 * gobiernan automáticamente las reservas. Aquí solo se exponen para consulta.
 */
export class TableController {
  constructor(private readonly listTablesUseCase: ListTablesUseCase) {}

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tables = await this.listTablesUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: tables,
      });
    } catch (error) {
      next(error);
    }
  };
}
