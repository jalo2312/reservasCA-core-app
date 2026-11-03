import { InvalidPropValueError } from '../exceptions/DomainError.js';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  createdAt: Date;
}

/**
 * Entidad de dominio que representa a un cliente registrado en el sistema.
 * Noten el uso de interfaces para definir las propiedades (Props) y el
 * Patrón Factory Method (`create`) para controlar cómo nace el objeto.
 */
export class User {
  private readonly props: UserProps;

  // Constructor privado: Fuerza a los desarrolladores a usar el método estático create()
  private constructor(props: UserProps) {
    this.props = props;
  }

  public static create(props: UserProps): User {
    // Invariante de Dominio: Un usuario no puede existir con un correo mal formado
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email)) {
      throw new InvalidPropValueError('El formato del correo electrónico es estructuralmente inválido.');
    }
    if (props.fullName.trim().length < 3) {
      throw new InvalidPropValueError('El nombre completo del usuario debe tener al menos 3 caracteres.');
    }
    if (props.passwordHash.trim().length === 0) {
      throw new InvalidPropValueError('Un usuario no puede existir sin una credencial (hash) válida.');
    }
    return new User(props);
  }

  // Getters puros. Exponemos la información sin permitir que la muten desde afuera.
  get id(): string {
    return this.props.id;
  }
  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get fullName(): string {
    return this.props.fullName;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
}
