import { User } from '../entities/User.js';
import { Table } from '../entities/Table.js';
import { Reservation } from '../entities/Reservation.js';

/**
 * Puertos (Interfaces) de persistencia definidos por el Dominio.
 * El Dominio dice: "No sé qué base de datos uses, pero quien quiera guardar
 * datos por mí, DEBE cumplir con estas reglas" (Principio de Inversión de Dependencias).
 */

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

export interface TableRepository {
  findById(id: string): Promise<Table | null>;
  findAll(): Promise<Table[]>;
}

export interface ReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findAll(): Promise<Reservation[]>;
  findByUserId(userId: string): Promise<Reservation[]>;
  update(reservation: Reservation): Promise<Reservation>;

  /**
   * Regla de negocio (Anti-Overbooking): reserva la mesa de forma atómica.
   *
   * La implementación de infraestructura DEBE garantizar que reclamar la mesa
   * (`AVAILABLE` → `RESERVED`) y crear el registro de la reserva ocurran en una
   * sola transacción. Gracias al aislamiento ACID, si dos peticiones compiten por
   * la misma mesa, solo la primera en tomar el bloqueo tendrá éxito.
   *
   * @returns la reserva persistida, o `null` si la mesa ya estaba reservada.
   */
  createReservingTable(reservation: Reservation): Promise<Reservation | null>;

  /**
   * Cancela la reserva y devuelve la mesa a `AVAILABLE` dentro de una sola
   * transacción, de modo que la mesa vuelve a quedar disponible para otros.
   */
  cancelAndRelease(reservation: Reservation): Promise<Reservation>;
}
