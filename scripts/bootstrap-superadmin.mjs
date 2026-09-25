import { createClient } from "@libsql/client";
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken || url.startsWith("file:")) {
  throw new Error("Set production TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before bootstrapping.");
}

const prompt = createInterface({ input: stdin, output: stdout });
const client = createClient({ url, authToken });
try {
  const name = (await prompt.question("Initial superadmin full name: ")).trim();
  const email = (await prompt.question("Individual staff email: ")).trim().toLowerCase();
  if (name.length < 3 || name.length > 120 || !/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    throw new Error("Enter a valid name and email address.");
  }
  const confirmation = (
    await prompt.question(
      "Create this initial superadmin in the connected production database? (yes/no): "
    )
  ).trim();
  if (confirmation !== "yes") throw new Error("Bootstrap cancelled.");

  const transaction = await client.transaction("write");
  try {
    const existing = await transaction.execute(
      "SELECT 1 FROM app_users WHERE role='SUPERADMIN' LIMIT 1"
    );
    if (existing.rows.length)
      throw new Error("A superadmin already exists; use the board invite flow instead.");
    const id = randomUUID();
    const timestamp = Date.now();
    await transaction.execute({
      sql: "INSERT INTO user(id,name,email,emailVerified,createdAt,updatedAt) VALUES(?,?,?,0,?,?)",
      args: [id, name, email, timestamp, timestamp],
    });
    await transaction.execute({
      sql: `INSERT INTO app_users(id,email,name,role,clearance,clearance_source,affiliation,claimed_affiliation,
        affiliation_verified,status,data,created_at,updated_at)
        VALUES(?,?,?,'SUPERADMIN','VI','SUPERADMIN_ROLE','RAS_BOARD','RAS_BOARD',1,'ACTIVE','{}',?,?)`,
      args: [id, email, name, timestamp, timestamp],
    });
    await transaction.commit();
    console.log(
      "Initial superadmin created. Sign in using that person's email link and complete the board code challenge."
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    transaction.close();
  }
} finally {
  prompt.close();
  client.close();
}
