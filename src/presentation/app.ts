import express, { type Application } from 'express';
import cors from 'cors';

// Infraestructura
import { prisma } from '../infrastructure/database/prisma.js';
import { BcryptPasswordHasher } from '../infrastructure/services/BcryptPasswordHasher.js';
import { JwtTokenService } from '../infrastructure/services/JwtTokenService.js';
import { PrismaUserRepository } from '../infrastructure/repositories/PrismaUserRepository.js';
import { PrismaTableRepository } from '../infrastructure/repositories/PrismaTableRepository.js';
import { PrismaReservationRepository } from '../infrastructure/repositories/PrismaReservationRepository.js';

// Casos de Uso (Capa de Aplicación)
import { RegisterUserUseCase } from '../use-cases/RegisterUserUseCase.js';
import { LoginUseCase } from '../use-cases/LoginUseCase.js';
import { ListTablesUseCase } from '../use-cases/ListTablesUseCase.js';
import { CreateReservationUseCase } from '../use-cases/CreateReservationUseCase.js';
import { ListReservationsUseCase } from '../use-cases/ListReservationsUseCase.js';
import { GetReservationUseCase } from '../use-cases/GetReservationUseCase.js';
import { RescheduleReservationUseCase } from '../use-cases/RescheduleReservationUseCase.js';
import { CancelReservationUseCase } from '../use-cases/CancelReservationUseCase.js';

// Presentación
import { AuthController } from './controllers/AuthController.js';
import { TableController } from './controllers/TableController.js';
import { ReservationController } from './controllers/ReservationController.js';
import { AuthMiddleware } from './middlewares/AuthMiddleware.js';
import { validateRequest } from './middlewares/validateRequest.js';
import { errorHandler } from './middlewares/ErrorHandler.js';
import { LoginSchema, RegisterUserSchema } from './dtos/AuthDTOs.js';
import { CreateReservationSchema, RescheduleReservationSchema } from './dtos/ReservationDTOs.js';

/**
 * Composition Root: aquí se ensamblan manualmente las dependencias concretas
 * (Inyección de Dependencias) y se registran las rutas HTTP.
 */
export function createApp(): Application {
  const app = express();

  // Middlewares globales
  // CORS restringido: solo se aceptan los orígenes declarados en CLIENT_ORIGIN
  // (lista separada por comas). Por defecto, el front en dev (Vite) y en Docker (Nginx).
  const allowedOrigins = (
    process.env.CLIENT_ORIGIN ?? 'http://localhost:5173,http://localhost:8080'
  )
    .split(',')
    .map((origin) => origin.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error(`Origen no permitido por política CORS: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json());

  // 1. Servicios de infraestructura
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(
    process.env.JWT_SECRET ?? 'default_secret',
    process.env.JWT_EXPIRES_IN ?? '1h',
  );

  // 2. Repositorios (adaptadores de persistencia)
  const userRepository = new PrismaUserRepository(prisma);
  const tableRepository = new PrismaTableRepository(prisma);
  const reservationRepository = new PrismaReservationRepository(prisma);

  // 3. Casos de Uso
  const registerUserUseCase = new RegisterUserUseCase(userRepository, passwordHasher);
  const loginUseCase = new LoginUseCase(userRepository, passwordHasher, tokenService);
  const listTablesUseCase = new ListTablesUseCase(tableRepository);
  const createReservationUseCase = new CreateReservationUseCase(reservationRepository, tableRepository);
  const listReservationsUseCase = new ListReservationsUseCase(reservationRepository);
  const getReservationUseCase = new GetReservationUseCase(reservationRepository);
  const rescheduleReservationUseCase = new RescheduleReservationUseCase(reservationRepository);
  const cancelReservationUseCase = new CancelReservationUseCase(reservationRepository);

  // 4. Controladores y guardias HTTP
  const authController = new AuthController(registerUserUseCase, loginUseCase);
  const tableController = new TableController(listTablesUseCase);
  const reservationController = new ReservationController(
    createReservationUseCase,
    listReservationsUseCase,
    getReservationUseCase,
    rescheduleReservationUseCase,
    cancelReservationUseCase,
  );
  const authMiddleware = new AuthMiddleware(tokenService);

  // 5. Enrutamiento de la API REST
  // Públicas
  app.post('/api/auth/register', validateRequest(RegisterUserSchema), authController.register);
  app.post('/api/auth/login', validateRequest(LoginSchema), authController.login);

  // Protegidas: Mesas (predefinidas, solo consulta)
  app.get('/api/tables', authMiddleware.handle, tableController.list);

  // Protegidas: Reservas
  app.get('/api/reservations', authMiddleware.handle, reservationController.list);
  app.post(
    '/api/reservations',
    authMiddleware.handle,
    validateRequest(CreateReservationSchema),
    reservationController.create,
  );
  app.get('/api/reservations/:id', authMiddleware.handle, reservationController.getById);
  app.patch(
    '/api/reservations/:id/reschedule',
    authMiddleware.handle,
    validateRequest(RescheduleReservationSchema),
    reservationController.reschedule,
  );
  app.patch('/api/reservations/:id/cancel', authMiddleware.handle, reservationController.cancel);

  // 6. Middleware Global de Errores (obligatoriamente al final)
  app.use(errorHandler);

  return app;
}
