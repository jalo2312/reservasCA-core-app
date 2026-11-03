import { PrismaClient } from '../../generated/prisma/client.js';
import type { TableRepository } from '../../domain/repositories/Repositories.js';
import type { Table } from '../../domain/entities/Table.js';
import { TableMapper } from '../mappers/TableMapper.js';

/**
 * Adaptador de persistencia que implementa el puerto `TableRepository`.
 * Las mesas son predefinidas (seed) y su estado lo gobiernan las reservas,
 * por lo que este repositorio solo expone lectura.
 */
export class PrismaTableRepository implements TableRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Table | null> {
    const row = await this.prisma.table.findUnique({ where: { id } });
    return row ? TableMapper.toDomain(row) : null;
  }

  async findAll(): Promise<Table[]> {
    const rows = await this.prisma.table.findMany({ orderBy: { number: 'asc' } });
    return rows.map(TableMapper.toDomain);
  }
}
