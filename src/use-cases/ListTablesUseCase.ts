import type { TableRepository } from '../domain/repositories/Repositories.js';
import { toTableOutputDTO, type TableOutputDTO } from './dto/TableDTOs.js';

/**
 * Caso de Uso: lista el catálogo de mesas predefinidas del restaurante.
 */
export class ListTablesUseCase {
  constructor(private readonly tableRepository: TableRepository) {}

  async execute(): Promise<TableOutputDTO[]> {
    const tables = await this.tableRepository.findAll();
    return tables.map(toTableOutputDTO);
  }
}
