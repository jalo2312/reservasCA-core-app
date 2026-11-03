import { DomainError } from './DomainError.js';

/**
 * Escenarios de fallo del subdominio de Identidad y Autenticación.
 * El lenguaje debe reflejar el negocio, no conceptos HTTP.
 */
export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`El correo [${email}] ya se encuentra registrado en el sistema.`);
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Las credenciales suministradas son inválidas.');
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`El usuario con ID '${userId}' no fue encontrado o no existe.`);
  }
}
