import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('La variable de entorno DATABASE_URL no está definida.');
}

// Driver Adapter: Prisma delega el transporte SQL al driver nativo `pg`.
const adapter = new PrismaPg({ connectionString });

/**
 * Instancia única (Singleton) del cliente Prisma instrumentado con el
 * adaptador de PostgreSQL. Se inyecta en los repositorios de infraestructura.
 */
export const prisma = new PrismaClient({ adapter });
