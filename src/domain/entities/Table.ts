import { InvalidPropValueError } from '../exceptions/DomainError.js';

/**
 * Estados posibles de una mesa. Se gestionan de forma automática por el sistema:
 * - `AVAILABLE`: la mesa está libre y admite una nueva reserva.
 * - `RESERVED`: la mesa tiene una reserva vigente y nadie más puede tomarla
 *   hasta que dicha reserva se cancele.
 */
export type TableStatus = 'AVAILABLE' | 'RESERVED';

export interface TableProps {
  id: string;
  number: number;
  capacity: number;
  location: string;
  status: TableStatus;
  createdAt: Date;
}

/**
 * Entidad de dominio que representa una mesa física del restaurante.
 * Las mesas son predefinidas (se cargan por seed), por lo que esta entidad
 * protege sus invariantes sin exponer un flujo de creación por API.
 */
export class Table {
  private props: TableProps;

  private constructor(props: TableProps) {
    this.props = props;
  }

  public static create(props: TableProps): Table {
    if (!Number.isInteger(props.number) || props.number <= 0) {
      throw new InvalidPropValueError('El número de mesa debe ser un entero positivo.');
    }
    if (!Number.isInteger(props.capacity) || props.capacity <= 0) {
      throw new InvalidPropValueError('La capacidad de una mesa debe ser un entero estrictamente mayor a cero.');
    }
    if (props.location.trim().length === 0) {
      throw new InvalidPropValueError('La ubicación (zona) de la mesa es obligatoria.');
    }
    return new Table(props);
  }

  get id(): string {
    return this.props.id;
  }
  get number(): number {
    return this.props.number;
  }
  get capacity(): number {
    return this.props.capacity;
  }
  get location(): string {
    return this.props.location;
  }
  get status(): TableStatus {
    return this.props.status;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  // --- COMPORTAMIENTOS DEL DOMINIO ---

  /**
   * Una mesa está disponible cuando no tiene una reserva vigente que la ocupe.
   */
  public isAvailable(): boolean {
    return this.props.status === 'AVAILABLE';
  }

  /**
   * Determina si la mesa tiene aforo suficiente para una comitiva de `partySize` comensales.
   */
  public canHost(partySize: number): boolean {
    return partySize <= this.props.capacity;
  }
}
