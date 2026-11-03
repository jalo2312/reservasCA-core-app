import { Prisma, type Table as PrismaTable } from '../../generated/prisma/client.js';
import { Table } from '../../domain/entities/Table.js';

/**
 * Data Mapper para la entidad `Table`. Convierte filas de la tabla `tables`
 * en entidades de dominio y viceversa.
 */
export class TableMapper {
  public static toDomain(prismaTable: PrismaTable): Table {
    return Table.create({
      id: prismaTable.id,
      number: prismaTable.number,
      capacity: prismaTable.capacity,
      location: prismaTable.location,
      status: prismaTable.status,
      createdAt: prismaTable.createdAt,
    });
  }

  public static toPersistence(table: Table): Prisma.TableUncheckedCreateInput {
    return {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
      createdAt: table.createdAt,
    };
  }
}
