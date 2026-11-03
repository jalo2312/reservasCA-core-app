import type { NextFunction, Request, Response } from 'express';
import type { RegisterUserUseCase } from '../../use-cases/RegisterUserUseCase.js';
import type { LoginUseCase } from '../../use-cases/LoginUseCase.js';
import type { RegisterUserDTO, LoginDTO } from '../dtos/AuthDTOs.js';

/**
 * Adaptador de entrada HTTP para el subdominio de autenticación.
 * No contiene lógica de negocio: delega en los Casos de Uso.
 */
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as RegisterUserDTO;
      const result = await this.registerUserUseCase.execute(body);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as LoginDTO;
      const result = await this.loginUseCase.execute(body);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
