/**
 * Password hashing utilities
 */

import crypto from 'crypto';

const SALT_LENGTH = 32;
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

/**
 * パスワードをハッシュ化
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');

    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * パスワードを検証
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hash] = hashedPassword.split(':');

    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(hash === derivedKey.toString('hex'));
    });
  });
}
