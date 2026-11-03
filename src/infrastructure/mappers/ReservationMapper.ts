import { Prisma, type Reservation as PrismaReservation } from '../../generated/prisma/client.js';
import { Reservation } from '../../domain/entities/Reservation.js';

/**
 * Data Mapper para la entidad `Reservation`. Del lado de persistencia usamos
 * el input "Unchecked" porque la entidad de dominio maneja `userId` y `tableId`
 * como valores escalares (identidad por ID) y no por referencia navegable.
 */
export class ReservationMapper {
  public static toDomain(prismaReservation: PrismaReservation): Reservation {
    return Reservation.create({
      id: prismaReservation.id,
      userId: prismaReservation.userId,
      tableId: prismaReservation.tableId,
      customerName: prismaReservation.customerName,
      startAt: prismaReservation.startAt,
      endAt: prismaReservation.endAt,
      partySize: prismaReservation.partySize,
      status: prismaReservation.status,
      createdAt: prismaReservation.createdAt,
    });
  }

  public static toPersistence(reservation: Reservation): Prisma.ReservationUncheckedCreateInput {
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
}
