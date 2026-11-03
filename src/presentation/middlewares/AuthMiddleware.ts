import type { NextFunction, Request, Response } from 'express';
import type { TokenService } from '../../domain/services/TokenService.js';

/**
 * Extensión de la interfaz Request de Express para inyectar la identidad
 * del usuario autenticado tras verificar el token JWT.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Guardia de seguridad (Auth Guard). Verifica la firma del Bearer Token
 * y adjunta el payload del usuario a la petición.
 */
export class AuthMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  public handle = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'fail',
        code: 'UNAUTHORIZED',
        message: 'Acceso denegado. Se requiere un Bearer Token válido en la cabecera Authorization.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      req.user = this.tokenService.verifyToken(token);
      next();
    } catch {
      res.status(401).json({
        status: 'fail',
        code: 'INVALID_TOKEN',
        message: 'El token de autenticación provisto es inválido o ha expirado.',
      });
    }
  };
}
