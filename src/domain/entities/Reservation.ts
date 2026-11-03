import { InvalidPropValueError } from '../exceptions/DomainError.js';
import {
  InvalidReservationStatusTransitionError,
  InvalidReservationTimeError,
  ReservationAlreadyCancelledError,
} from '../exceptions/ReservationError.js';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface ReservationProps {
  id: string;
  userId: string;
  tableId: string;
  customerName: string;
  startAt: Date;
  endAt: Date;
  partySize: number;
  status: ReservationStatus;
  createdAt: Date;
}

/**
 * Entidad de dominio que representa la reserva de una mesa en un rango horario.
 * Aplica un Modelo de Dominio Rico controlando las transiciones de estado válidas.
 */
export class Reservation {
  private props: ReservationProps;

  private constructor(props: ReservationProps) {
    this.props = props;
  }

  public static create(props: ReservationProps): Reservation {
    Reservation.validateTimeRange(props.startAt, props.endAt);

    if (!Number.isInteger(props.partySize) || props.partySize <= 0) {
      throw new InvalidPropValueError('El número de comensales debe ser un entero estrictamente mayor a cero.');
    }
    if (props.customerName.trim().length < 3) {
      throw new InvalidPropValueError('El nombre del titular de la reserva debe tener al menos 3 caracteres.');
    }
    return new Reservation(props);
  }

  /**
   * Invariante estructural: un rango horario válido exige inicio anterior al fin.
   */
  private static validateTimeRange(startAt: Date, endAt: Date): void {
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new InvalidReservationTimeError('Las fechas de inicio y fin deben ser válidas.');
    }
    if (startAt.getTime() >= endAt.getTime()) {
      throw new InvalidReservationTimeError('La hora de inicio debe ser estrictamente anterior a la hora de fin.');
    }
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get tableId(): string {
    return this.props.tableId;
  }
  get customerName(): string {
    return this.props.customerName;
  }
  get startAt(): Date {
    return this.props.startAt;
  }
  get endAt(): Date {
    return this.props.endAt;
  }
  get partySize(): number {
    return this.props.partySize;
  }
  get status(): ReservationStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  // --- COMPORTAMIENTOS DEL DOMINIO (Máquina de estados) ---

  public confirm(): void {
    if (this.props.status !== 'PENDING') {
      throw new InvalidReservationStatusTransitionError(this.props.status, 'CONFIRMED');
    }
    this.props.status = 'CONFIRMED';
  }

  public cancel(): void {
    if (this.props.status === 'CANCELLED') {
      throw new ReservationAlreadyCancelledError(this.props.id);
    }
    if (this.props.status === 'COMPLETED') {
      throw new InvalidReservationStatusTransitionError(this.props.status, 'CANCELLED');
    }
    this.props.status = 'CANCELLED';
  }

  public complete(): void {
    if (this.props.status !== 'CONFIRMED') {
      throw new InvalidReservationStatusTransitionError(this.props.status, 'COMPLETED');
    }
    this.props.status = 'COMPLETED';
  }

  /**
   * Reprograma el rango horario de la reserva. No está permitido sobre
   * reservas canceladas o ya finalizadas.
   */
  public reschedule(startAt: Date, endAt: Date): void {
    if (this.props.status === 'CANCELLED' || this.props.status === 'COMPLETED') {
      throw new InvalidReservationStatusTransitionError(this.props.status, 'RESCHEDULED');
    }
    Reservation.validateTimeRange(startAt, endAt);
    this.props.startAt = startAt;
    this.props.endAt = endAt;
  }
}
