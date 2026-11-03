import type { ReservationRepository } from '../domain/repositories/Repositories.js';
import { ReservationNotFoundError } from '../domain/exceptions/ReservationError.js';
import {
  toReservationOutputDTO,
  type ReservationOutputDTO,
  type RescheduleReservationInputDTO,
} from './dto/ReservationDTOs.js';

/**
 * Caso de Uso: reprograma el rango horario de una reserva vigente.
 * La mesa ya está reservada por esta reserva, por lo que solo se valida la
 * invariante del rango (dominio) y se persiste el cambio.
 */
export class RescheduleReservationUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(input: RescheduleReservationInputDTO): Promise<ReservationOutputDTO> {
    const reservation = await this.reservationRepository.findById(input.reservationId);

    if (!reservation) {
      throw new ReservationNotFoundError(input.reservationId);
    }

    // El dominio valida el nuevo rango horario y la transición permitida.
    reservation.reschedule(input.startAt, input.endAt);

    const savedReservation = await this.reservationRepository.update(reservation);

    return toReservationOutputDTO(savedReservation);
  }
}
