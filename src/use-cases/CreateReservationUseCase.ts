import { randomUUID } from 'node:crypto';
import type { ReservationRepository, TableRepository } from '../domain/repositories/Repositories.js';
import { Reservation } from '../domain/entities/Reservation.js';
import { TableNotFoundError, TableAlreadyReservedError } from '../domain/exceptions/TableError.js';
import { TableCapacityExceededError } from '../domain/exceptions/ReservationError.js';
import {
  toReservationOutputDTO,
  type CreateReservationInputDTO,
  type ReservationOutputDTO,
} from './dto/ReservationDTOs.js';

/**
 * Caso de Uso: crea una reserva sobre una mesa predefinida.
 *
 * Reglas de negocio:
 *  1. La mesa debe existir.
 *  2. La mesa debe estar disponible (sin otra reserva vigente).
 *  3. La mesa debe tener capacidad suficiente para la comitiva.
 *  4. La mesa queda `RESERVED` de forma automática al reservarla.
 *
 * La verificación de disponibilidad y la toma de la mesa se delegan al
 * repositorio mediante `createReservingTable`, que las ejecuta de forma atómica
 * (anti-overbooking): si dos clientes compiten por la misma mesa, el primero en
 * llegar se la queda y el segundo recibe `null`.
 */
export class CreateReservationUseCase {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly tableRepository: TableRepository,
  ) {}

  async execute(input: CreateReservationInputDTO): Promise<ReservationOutputDTO> {
    const table = await this.tableRepository.findById(input.tableId);

    if (!table) {
      throw new TableNotFoundError(input.tableId);
    }

    if (!table.isAvailable()) {
      throw new TableAlreadyReservedError(input.tableId);
    }

    if (!table.canHost(input.partySize)) {
      throw new TableCapacityExceededError(input.partySize, table.capacity);
    }

    const reservation = Reservation.create({
      id: randomUUID(),
      userId: input.userId,
      tableId: input.tableId,
      customerName: input.customerName,
      startAt: input.startAt,
      endAt: input.endAt,
      partySize: input.partySize,
      status: 'PENDING',
      createdAt: new Date(),
    });

    const savedReservation = await this.reservationRepository.createReservingTable(reservation);

    if (!savedReservation) {
      // Otro cliente tomó la mesa entre la verificación y la escritura.
      throw new TableAlreadyReservedError(input.tableId);
    }

    return toReservationOutputDTO(savedReservation);
  }
}
