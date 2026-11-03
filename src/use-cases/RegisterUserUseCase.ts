import { randomUUID } from 'node:crypto';
import type { UserRepository } from '../domain/repositories/Repositories.js';
import type { PasswordHasher } from '../domain/services/PasswordHasher.js';
import { User } from '../domain/entities/User.js';
import { UserAlreadyExistsError } from '../domain/exceptions/AuthError.js';
import type { RegisterUserInputDTO, RegisterUserOutputDTO } from './dto/AuthDTOs.js';

/**
 * Caso de Uso: registra un nuevo usuario en el sistema.
 * Orquesta el flujo: verificar unicidad -> hashear credencial -> crear entidad -> persistir.
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(input: RegisterUserInputDTO): Promise<RegisterUserOutputDTO> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new UserAlreadyExistsError(input.email);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: randomUUID(),
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      createdAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);

    return {
      userId: savedUser.id,
      email: savedUser.email,
      fullName: savedUser.fullName,
    };
  }
}
