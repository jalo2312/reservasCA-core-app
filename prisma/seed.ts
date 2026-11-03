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
 * Catálogo de mesas predefinidas del restaurante.
 * Las mesas NO se crean por API: se cargan aquí mediante seed.
 */
const PREDEFINED_TABLES = [
  { number: 1, capacity: 2, location: 'Terraza' },
  { number: 2, capacity: 2, location: 'Terraza' },
  { number: 3, capacity: 4, location: 'Salón Principal' },
  { number: 4, capacity: 4, location: 'Salón Principal' },
  { number: 5, capacity: 6, location: 'Salón Principal' },
  { number: 6, capacity: 8, location: 'Zona Familiar' },
  { number: 7, capacity: 8, location: 'Zona Familiar' },
  { number: 8, capacity: 10, location: 'Privado' },
];

async function main(): Promise<void> {
  for (const table of PREDEFINED_TABLES) {
    await prisma.table.upsert({
      where: { number: table.number },
      update: {
        capacity: table.capacity,
        location: table.location,
      },
      create: {
        number: table.number,
        capacity: table.capacity,
        location: table.location,
        status: TableStatus.AVAILABLE,
      },
    });
  }

  console.log(`Seed completado: ${PREDEFINED_TABLES.length} mesas predefinidas cargadas.`);
}

main()
  .catch((error) => {
    console.error('Error durante el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
