import type { UserRepository } from '../domain/repositories/Repositories.js';
import type { PasswordHasher } from '../domain/services/PasswordHasher.js';
import type { TokenService } from '../domain/services/TokenService.js';
import { InvalidCredentialsError } from '../domain/exceptions/AuthError.js';
import type { LoginInputDTO, LoginOutputDTO } from './dto/AuthDTOs.js';

/**
 * Caso de Uso: autentica un usuario y emite un token JWT.
 * Aplica el principio Fail-Fast: valida credenciales antes de emitir el token.
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInputDTO): Promise<LoginOutputDTO> {
    const user = await this.userRepository.findByEmail(input.email);

    // Mensaje genérico intencional: no revelamos si el correo existe o no.
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }
}
