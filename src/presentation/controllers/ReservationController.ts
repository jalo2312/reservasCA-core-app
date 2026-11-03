import type { NextFunction, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/AuthMiddleware.js';
import type { CreateReservationUseCase } from '../../use-cases/CreateReservationUseCase.js';
import type { ListReservationsUseCase } from '../../use-cases/ListReservationsUseCase.js';
import type { GetReservationUseCase } from '../../use-cases/GetReservationUseCase.js';
import type { RescheduleReservationUseCase } from '../../use-cases/RescheduleReservationUseCase.js';
import type { CancelReservationUseCase } from '../../use-cases/CancelReservationUseCase.js';
import type { CreateReservationDTO, RescheduleReservationDTO } from '../dtos/ReservationDTOs.js';

/**
 * Adaptador de entrada HTTP para el CRUD de reservas de mesa.
 * La identidad del titular se toma del token JWT, nunca del body.
 */
export class ReservationController {
  constructor(
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly listReservationsUseCase: ListReservationsUseCase,
    private readonly getReservationUseCase: GetReservationUseCase,
    private readonly rescheduleReservationUseCase: RescheduleReservationUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
  ) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const body = req.body as CreateReservationDTO;
      const result = await this.createReservationUseCase.execute({ ...body, userId });

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const reservations = await this.listReservationsUseCase.execute({ userId });

      res.status(200).json({
        status: 'success',
        data: reservations,
      });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const reservation = await this.getReservationUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: reservation,
      });
    } catch (error) {
      next(error);
    }
  };

  reschedule = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const body = req.body as RescheduleReservationDTO;
      const result = await this.rescheduleReservationUseCase.execute({
        reservationId: id,
        ...body,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      const result = await this.cancelReservationUseCase.execute(id);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
