import type { ReservationRepository } from '../domain/repositories/Repositories.js';
import { ReservationNotFoundError } from '../domain/exceptions/ReservationError.js';
import { toReservationOutputDTO, type ReservationOutputDTO } from './dto/ReservationDTOs.js';

/**
 * Caso de Uso: cancela una reserva (baja lógica, los datos se conservan).
 * Delega la transición de estado al comportamiento de dominio `cancel()` y
 * solicita al repositorio liberar la mesa (`RESERVED` → `AVAILABLE`) de forma
 * atómica, de modo que vuelva a estar disponible para otros clientes.
 */
export class CancelReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(reservationId: string): Promise<ReservationOutputDTO> {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(reservationId);
    }

    reservation.cancel();
    const savedReservation = await this.reservationRepository.cancelAndRelease(reservation);

    return toReservationOutputDTO(savedReservation);
  }
}
