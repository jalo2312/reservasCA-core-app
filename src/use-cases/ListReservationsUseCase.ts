import type { ReservationRepository } from '../domain/repositories/Repositories.js';
import {
  toReservationOutputDTO,
  type ListReservationsInputDTO,
  type ReservationOutputDTO,
} from './dto/ReservationDTOs.js';

/**
 * Caso de Uso: lista reservas. Si se provee `userId`, filtra las del usuario;
 * en caso contrario devuelve el listado completo (rol administrador).
 */
export class ListReservationsUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute(input: ListReservationsInputDTO = {}): Promise<ReservationOutputDTO[]> {
    const reservations = input.userId
      ? await this.reservationRepository.findByUserId(input.userId)
      : await this.reservationRepository.findAll();

    return reservations.map(toReservationOutputDTO);
  }
}
