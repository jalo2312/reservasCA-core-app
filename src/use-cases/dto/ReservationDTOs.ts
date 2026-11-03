import type { Reservation, ReservationStatus } from '../../domain/entities/Reservation.js';

export interface CreateReservationInputDTO {
  userId: string;
  tableId: string;
  customerName: string;
  startAt: Date;
  endAt: Date;
  partySize: number;
}

export interface RescheduleReservationInputDTO {
  reservationId: string;
  startAt: Date;
  endAt: Date;
}

export interface ListReservationsInputDTO {
  userId?: string;
}

export interface ReservationOutputDTO {
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

export function toReservationOutputDTO(reservation: Reservation): ReservationOutputDTO {
  return {
    id: reservation.id,
    userId: reservation.userId,
    tableId: reservation.tableId,
    customerName: reservation.customerName,
    startAt: reservation.startAt,
    endAt: reservation.endAt,
    partySize: reservation.partySize,
    status: reservation.status,
    createdAt: reservation.createdAt,
  };
}
