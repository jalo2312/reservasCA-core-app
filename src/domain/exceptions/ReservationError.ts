import { DomainError } from './DomainError.js';

/**
 * Escenarios de fallo de las reglas de negocio de reservación de mesas.
 */
export class ReservationNotFoundError extends DomainError {
  constructor(reservationId: string) {
    super(`La reserva con ID '${reservationId}' no fue encontrada o no existe.`);
  }
}

export class TableCapacityExceededError extends DomainError {
  constructor(partySize: number, capacity: number) {
    super(
      `La mesa no puede albergar la reserva: se solicitaron ${partySize} comensales ` +
        `y su capacidad máxima es ${capacity}.`,
    );
  }
}

export class InvalidReservationTimeError extends DomainError {
  constructor(message: string) {
    super(`Validación de horario fallida: ${message}`);
  }
}

export class ReservationAlreadyCancelledError extends DomainError {
  constructor(reservationId: string) {
    super(`La reserva [${reservationId}] ya se encuentra cancelada y no admite más cambios.`);
  }
}

export class InvalidReservationStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Transición de estado inválida: no se puede pasar de '${from}' a '${to}'.`);
  }
}
