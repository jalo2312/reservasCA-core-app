import { DomainError } from './DomainError.js';

/**
 * Escenarios de fallo relacionados con las mesas del restaurante.
 */
export class TableNotFoundError extends DomainError {
  constructor(tableId: string) {
    super(`La mesa con ID '${tableId}' no fue encontrada o no existe.`);
  }
}

export class TableAlreadyReservedError extends DomainError {
  constructor(tableId: string) {
    super(`La mesa [${tableId}] ya está reservada. No estará disponible hasta que la reserva vigente se cancele.`);
  }
}
