import { PrismaClient } from '../../generated/prisma/client.js';
import type { UserRepository } from '../../domain/repositories/Repositories.js';
import type { User } from '../../domain/entities/User.js';
import { UserMapper } from '../mappers/UserMapper.js';

/**
 * Adaptador de persistencia que implementa el puerto `UserRepository`
 * utilizando Prisma ORM contra PostgreSQL.
 */
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async save(user: User): Promise<User> {
    const data = UserMapper.toPersistence(user);

    // Upsert: inserta si el usuario no existe, actualiza sus credenciales si ya existe.
    const row = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
      },
      create: data,
    });

    return UserMapper.toDomain(row);
  }
}
