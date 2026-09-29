import { hashPassword, verifyPassword } from "better-auth/crypto";
export { hashPassword, verifyPassword };
import type { Env } from "./env";

// Unambiguous characters only (no 0/O, 1/l/I) so credentials can be read out or typed reliably.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/** Generates a 16-character password from a CSPRNG using rejection sampling (no modulo bias). */
export function generatePassword(length = 16) {
  const limit = 256 - (256 % ALPHABET.length);
  let out = "";
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (byte < limit && out.length < length) out += ALPHABET[byte % ALPHABET.length];
    }
  }
  return out;
}

/** Statements that (re)set a user's credential password. Only the hash is stored. */
export async function credentialStatements(env: Env, userId: string, password: string) {
  const hash = await hashPassword(password);
  const timestamp = Date.now();
  return [
    env.DB.prepare("DELETE FROM account WHERE userId=? AND providerId='credential'").bind(userId),
    env.DB.prepare(
      "INSERT INTO account(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?)"
    ).bind(crypto.randomUUID(), userId, "credential", userId, hash, timestamp, timestamp),
  ];
}

export async function checkPassword(env: Env, userId: string, password: string) {
  const row = await env.DB.prepare(
    "SELECT password FROM account WHERE userId=? AND providerId='credential'"
  )
    .bind(userId)
    .first<{ password: string | null }>();
  return Boolean(row?.password) && verifyPassword({ hash: row!.password!, password });
}
