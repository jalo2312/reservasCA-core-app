import type { Table, TableStatus } from '../../domain/entities/Table.js';

export interface TableOutputDTO {
  id: string;
  number: number;
  capacity: number;
  location: string;
  status: TableStatus;
  createdAt: Date;
}

export function toTableOutputDTO(table: Table): TableOutputDTO {
  return {
    id: table.id,
    number: table.number,
    capacity: table.capacity,
    location: table.location,
    status: table.status,
    createdAt: table.createdAt,
  };
}
