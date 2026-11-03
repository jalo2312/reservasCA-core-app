import { PrismaClient } from '../../generated/prisma/client.js';
import type { ReservationRepository } from '../../domain/repositories/Repositories.js';
import type { Reservation } from '../../domain/entities/Reservation.js';
import { ReservationMapper } from '../mappers/ReservationMapper.js';

/**
 * Adaptador de persistencia que implementa el puerto `ReservationRepository`.
 * Encapsula aquí la atomicidad de las operaciones críticas de negocio
 * (anti-overbooking y liberación de mesa) para que la capa de aplicación
 * permanezca libre de acoplamiento a Prisma.
 */
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Reservation | null> {
    const row = await this.prisma.reservation.findUnique({ where: { id } });
    return row ? ReservationMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({ orderBy: { startAt: 'asc' } });
    return rows.map(ReservationMapper.toDomain);
  }

  async findByUserId(userId: string): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({
      where: { userId },
      orderBy: { startAt: 'asc' },
    });
    return rows.map(ReservationMapper.toDomain);
  }

  async update(reservation: Reservation): Promise<Reservation> {
    const data = ReservationMapper.toPersistence(reservation);

    const row = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        startAt: data.startAt,
        endAt: data.endAt,
        partySize: data.partySize,
        status: data.status,
      },
    });

    return ReservationMapper.toDomain(row);
  }

  /**
   * Anti-overbooking atómico. En una sola transacción:
   *  1. Reclama la mesa con un `update` condicional (compare-and-swap):
   *     solo pasa a RESERVED si seguía en AVAILABLE.
   *  2. Si nadie más la tomó (`count === 1`), crea la reserva.
   *
   * El aislamiento de PostgreSQL serializa a los competidores por la misma fila:
   * el primero en tomar el bloqueo gana y el resto obtiene `count === 0`.
   */
  async createReservingTable(reservation: Reservation): Promise<Reservation | null> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.table.updateMany({
        where: { id: reservation.tableId, status: 'AVAILABLE' },
        data: { status: 'RESERVED' },
      });

      if (claimed.count === 0) {
        return null;
      }

      const row = await tx.reservation.create({
        data: ReservationMapper.toPersistence(reservation),
      });

      return ReservationMapper.toDomain(row);
    });
  }

  /**
   * Cancela la reserva y libera la mesa (RESERVED → AVAILABLE) en una sola
   * transacción, de modo que la mesa vuelva a quedar disponible para otros.
   */
  async cancelAndRelease(reservation: Reservation): Promise<Reservation> {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: reservation.status },
      });

      await tx.table.update({
        where: { id: reservation.tableId },
        data: { status: 'AVAILABLE' },
      });

      return ReservationMapper.toDomain(row);
    });
  }
}
