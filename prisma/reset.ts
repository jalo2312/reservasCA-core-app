import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { TableStatus } from '../src/generated/prisma/enums.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('La variable de entorno DATABASE_URL no está definida.');
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

/**
 * Reinicia el estado de la base de datos para empezar una demo desde cero:
 *  1. Borra todas las reservas (los datos de prueba, no las mesas).
 *  2. Borra todos los usuarios.
 *  3. Libera todas las mesas (RESERVED -> AVAILABLE).
 *
 * Las mesas predefinidas (seed) se conservan; solo se restablece su estado.
 */
async function main(): Promise<void> {
  const reservations = await prisma.reservation.deleteMany();
  const users = await prisma.user.deleteMany();
  const tables = await prisma.table.updateMany({ data: { status: TableStatus.AVAILABLE } });

  console.log('Reset completado:');
  console.log(`  - Reservas eliminadas: ${reservations.count}`);
  console.log(`  - Usuarios eliminados: ${users.count}`);
  console.log(`  - Mesas liberadas (AVAILABLE): ${tables.count}`);
}

main()
  .catch((error) => {
    console.error('Error durante el reset:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
