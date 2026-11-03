import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/services/PasswordHasher.js';

const SALT_ROUNDS = 10;

/**
 * Adaptador concreto del puerto `PasswordHasher` usando la librería bcrypt.
 */
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
