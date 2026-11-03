import jwt from 'jsonwebtoken';
import type { TokenPayload, TokenService } from '../../domain/services/TokenService.js';

/**
 * Adaptador concreto del puerto `TokenService` usando JSON Web Tokens (HS256).
 */
export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  generateToken(payload: TokenPayload): string {
    return jwt.sign({ userId: payload.userId, email: payload.email }, this.secret, {
      expiresIn: this.expiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret);

    if (typeof decoded === 'string') {
      throw new Error('Token JWT malformado: se esperaba un payload con estructura de objeto.');
    }

    return {
      userId: String(decoded.userId),
      email: String(decoded.email),
    };
  }
}
