import { createClient, type Client, type InArgs, type InValue } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import type { ResultSet } from "@libsql/client";
import * as schema from "./schema";
import type { D1Database, D1PreparedStatement, D1Result } from "./env";

export const authSchema = {
  user: schema.authUsers,
  session: schema.authSessions,
  account: schema.authAccounts,
  verification: schema.authVerifications,
  rateLimit: schema.authRateLimits,
};

export function createAuthDatabase(client: Client) {
  return drizzle(client, { schema: authSchema });
}

export type AuthDatabase = ReturnType<typeof createAuthDatabase>;

class LibSqlPreparedStatement implements D1PreparedStatement {
  private args: InArgs = [];

  constructor(
    private readonly client: Client,
    private readonly sql: string
  ) {}

  bind(...values: unknown[]) {
    if (values.some((value) => value === undefined))
      throw new TypeError("SQL arguments cannot be undefined");
    this.args = values as InValue[];
    return this;
  }

  async first<T>() {
    const result = await this.client.execute({ sql: this.sql, args: this.args });
    return (result.rows[0] as T | undefined) ?? null;
  }

  async all<T>() {
    const result = await this.client.execute({ sql: this.sql, args: this.args });
    return toD1Result<T>(result);
  }

  async run() {
    return toD1Result<Record<string, unknown>>(
      await this.client.execute({ sql: this.sql, args: this.args })
    );
  }

  asLibSqlStatement() {
    return { sql: this.sql, args: this.args };
  }
}

function toD1Result<T>(result: ResultSet): D1Result<T> {
  return {
    success: true,
    results: result.rows as T[],
    meta: { changes: result.rowsAffected, last_row_id: result.lastInsertRowid },
  };
}

/** Keeps the existing reviewed SQLite queries and atomic batches on Turso/libSQL. */
export class LibSqlD1Database implements D1Database {
  constructor(private readonly client: Client) {}

  prepare(sql: string) {
    return new LibSqlPreparedStatement(this.client, sql);
  }

  async batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]) {
    if (statements.length === 0) return [];
    const queries = statements.map((statement) => {
      if (!(statement instanceof LibSqlPreparedStatement))
        throw new TypeError("Batch statement belongs to another database");
      return statement.asLibSqlStatement();
    });
    const results = await this.client.batch(queries, "write");
    return results.map(toD1Result<T>);
  }
}

export function createLibSqlClient(url: string, authToken?: string) {
  return createClient({ url, authToken });
}
