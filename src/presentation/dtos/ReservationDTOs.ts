import { z } from 'zod';

/**
 * DTO de frontera para crear una reserva de mesa.
 * Las fechas se reciben como ISO-8601 y se coercen a `Date` en la frontera.
 */
export const CreateReservationSchema = z.object({
  tableId: z.uuid({ error: 'El ID de la mesa debe ser un UUID válido' }),
  customerName: z
    .string({ error: 'El nombre del titular es requerido' })
    .min(3, { error: 'El nombre del titular debe tener al menos 3 caracteres' })
    .max(100, { error: 'El nombre del titular no puede exceder 100 caracteres' }),
  startAt: z.coerce.date({ error: 'La fecha y hora de inicio son requeridas' }),
  endAt: z.coerce.date({ error: 'La fecha y hora de fin son requeridas' }),
  partySize: z.coerce
    .number({ error: 'El número de comensales es requerido' })
    .int({ error: 'El número de comensales debe ser un entero' })
    .positive({ error: 'El número de comensales debe ser mayor a cero' }),
});

/**
 * DTO de frontera para reprogramar el rango horario de una reserva.
 */
export const RescheduleReservationSchema = z.object({
  startAt: z.coerce.date({ error: 'La fecha y hora de inicio son requeridas' }),
  endAt: z.coerce.date({ error: 'La fecha y hora de fin son requeridas' }),
});

export type CreateReservationDTO = z.infer<typeof CreateReservationSchema>;
export type RescheduleReservationDTO = z.infer<typeof RescheduleReservationSchema>;
