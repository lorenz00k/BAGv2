import { hash, verify } from "@node-rs/argon2";

// Argon2 Config (OWASP Empfehlung)
const hashOptions = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};
// Hash of a throwaway value. Verifying against it costs as much as a real
// check, so an unknown email takes as long as a wrong password.
export const DUMMY_HASH: Promise<string> = hashPassword("not-a-real-password");

export async function hashPassword(password: string): Promise<string> {
  return hash(password, hashOptions);
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await verify(hash, password);
  } catch {
    return false;
  }
}