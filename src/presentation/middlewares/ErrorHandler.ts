import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { DomainError } from '../../domain/exceptions/DomainError.js';
import {
  InvalidCredentialsError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../../domain/exceptions/AuthError.js';
import { TableNotFoundError, TableAlreadyReservedError } from '../../domain/exceptions/TableError.js';
import {
  InvalidReservationStatusTransitionError,
  InvalidReservationTimeError,
  ReservationAlreadyCancelledError,
  ReservationNotFoundError,
  TableCapacityExceededError,
} from '../../domain/exceptions/ReservationError.js';

/**
 * Middleware Global de Manejo de Errores.
 * Actúa como barrera de contención en la frontera: traduce excepciones de
 * dominio y fallos conocidos de Prisma a respuestas HTTP normalizadas,
 * evitando filtrar detalles internos de la base de datos.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // --- Excepciones de dominio con semántica HTTP específica ---
  if (err instanceof UserAlreadyExistsError) {
    res.status(409).json({ status: 'fail', code: 'USER_ALREADY_EXISTS', message: err.message });
    return;
  }

  if (err instanceof InvalidCredentialsError) {
    res.status(401).json({ status: 'fail', code: 'INVALID_CREDENTIALS', message: err.message });
    return;
  }

  if (err instanceof UserNotFoundError) {
    res.status(404).json({ status: 'fail', code: 'USER_NOT_FOUND', message: err.message });
    return;
  }

  if (err instanceof TableNotFoundError) {
    res.status(404).json({ status: 'fail', code: 'TABLE_NOT_FOUND', message: err.message });
    return;
  }

  if (err instanceof ReservationNotFoundError) {
    res.status(404).json({ status: 'fail', code: 'RESERVATION_NOT_FOUND', message: err.message });
    return;
  }

  if (err instanceof TableAlreadyReservedError) {
    res.status(409).json({ status: 'fail', code: 'TABLE_ALREADY_RESERVED', message: err.message });
    return;
  }

  if (err instanceof ReservationAlreadyCancelledError) {
    res
      .status(409)
      .json({ status: 'fail', code: 'RESERVATION_ALREADY_CANCELLED', message: err.message });
    return;
  }

  if (err instanceof InvalidReservationStatusTransitionError) {
    res.status(409).json({ status: 'fail', code: 'INVALID_STATUS_TRANSITION', message: err.message });
    return;
  }

  if (err instanceof TableCapacityExceededError) {
    res.status(400).json({ status: 'fail', code: 'TABLE_CAPACITY_EXCEEDED', message: err.message });
    return;
  }

  if (err instanceof InvalidReservationTimeError) {
    res.status(400).json({ status: 'fail', code: 'INVALID_RESERVATION_TIME', message: err.message });
    return;
  }

  // Cualquier otra violación de invariante de dominio se trata como 400.
  if (err instanceof DomainError) {
    res.status(400).json({ status: 'fail', code: 'DOMAIN_VALIDATION_ERROR', message: err.message });
    return;
  }

  // --- Excepciones conocidas de Prisma (ORM / Base de Datos) ---
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        status: 'fail',
        code: 'DUPLICATE_FIELD',
        message: 'Existe un conflicto con un dato único ya registrado en el sistema.',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        status: 'fail',
        code: 'RESOURCE_NOT_FOUND',
        message: 'El recurso solicitado no fue encontrado en la base de datos.',
      });
      return;
    }
  }

  // --- Fallos inesperados de infraestructura ---
  console.error('[UNHANDLED CRITICAL ERROR]:', err);

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Ocurrió un error interno e inesperado en el servidor. Por favor intente más tarde.',
  });
};
