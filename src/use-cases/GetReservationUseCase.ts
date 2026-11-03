import type { ReservationRepository } from '../domain/repositories/Repositories.js';
import { ReservationNotFoundError } from '../domain/exceptions/ReservationError.js';
import { toReservationOutputDTO, type ReservationOutputDTO } from './dto/ReservationDTOs.js';

/**
 * Caso de Uso: recupera una reserva por su identificador.
 */
export class GetReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(reservationId: string): Promise<ReservationOutputDTO> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(reservationId);
    }

    return toReservationOutputDTO(reservation);
  }
}
