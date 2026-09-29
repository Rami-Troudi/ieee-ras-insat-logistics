// Generates a password for staff accounts and stores only its hash (Better Auth credential).
// Usage: node scripts/set-staff-passwords.mjs <credentials-file> [email ...]
// With no emails, every ACTIVE OPERATOR/SUPERADMIN gets a new password. Plaintext passwords are
// written only to <credentials-file> (mode 600); hand them over, then delete the file.
import { createClient } from "@libsql/client";
import { hashPassword } from "better-auth/crypto";
import { randomInt, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken || url.startsWith("file:")) {
  throw new Error("Set production TURSO_DATABASE_URL and TURSO_AUTH_TOKEN first.");
}
const [outFile, ...emails] = process.argv.slice(2);
if (!outFile) throw new Error("Usage: set-staff-passwords.mjs <credentials-file> [email ...]");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const generate = () =>
  Array.from({ length: 16 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

const client = createClient({ url, authToken });
try {
  const rows = (
    await client.execute(
      "SELECT id,name,email FROM app_users WHERE role IN ('OPERATOR','SUPERADMIN') AND status='ACTIVE'"
    )
  ).rows.filter((row) => !emails.length || emails.includes(String(row.email).toLowerCase()));
  if (!rows.length) throw new Error("No matching active staff accounts.");
  const lines = [];
  for (const row of rows) {
    const password = generate();
    const timestamp = Date.now();
    await client.batch(
      [
        { sql: "DELETE FROM account WHERE userId=? AND providerId='credential'", args: [row.id] },
        {
          sql: "INSERT INTO account(id,accountId,providerId,userId,password,createdAt,updatedAt) VALUES(?,?,?,?,?,?,?)",
          args: [
            randomUUID(),
            row.id,
            "credential",
            row.id,
            await hashPassword(password),
            timestamp,
            timestamp,
          ],
        },
      ],
      "write"
    );
    lines.push(`${row.name} <${row.email}>  ${password}`);
  }
  writeFileSync(outFile, `${lines.join("\n")}\n`, { mode: 0o600 });
  console.log(`Set passwords for ${rows.length} account(s); credentials written to ${outFile}`);
} finally {
  client.close();
}
