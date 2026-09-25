import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const authUsers = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("user_email").on(table.email)]
);

export const authSessions = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("session_token").on(table.token),
    index("session_user_id").on(table.userId),
  ]
);

export const authAccounts = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("account_user_id").on(table.userId)]
);

export const authVerifications = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
  },
  (table) => [index("verification_identifier").on(table.identifier)]
);

export const authRateLimits = sqliteTable(
  "rateLimit",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    count: integer("count").notNull(),
    lastRequest: integer("lastRequest").notNull(),
  },
  (table) => [uniqueIndex("rate_limit_key").on(table.key)]
);

export const appUsers = sqliteTable(
  "app_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    role: text("role", { enum: ["MEMBER", "OPERATOR", "SUPERADMIN"] })
      .notNull()
      .default("MEMBER"),
    clearance: text("clearance").notNull().default("I"),
    clearanceSource: text("clearance_source"),
    affiliation: text("affiliation").notNull().default("EXTERNAL"),
    claimedAffiliation: text("claimed_affiliation"),
    affiliationVerified: integer("affiliation_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    status: text("status").notNull().default("ACTIVE"),
    data: text("data", { mode: "json" }).notNull().default("{}"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("app_users_email").on(table.email),
    index("app_users_role_status").on(table.role, table.status),
  ]
);

export const inventory = sqliteTable(
  "inventory",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(),
    equipmentClass: text("equipment_class").notNull(),
    trackingMode: text("tracking_mode").notNull(),
    totalQuantity: integer("total_quantity").notNull().default(0),
    availableQuantity: integer("available_quantity").notNull().default(0),
    allocatedQuantity: integer("allocated_quantity").notNull().default(0),
    borrowedQuantity: integer("borrowed_quantity").notNull().default(0),
    damagedQuantity: integer("damaged_quantity").notNull().default(0),
    maintenanceQuantity: integer("maintenance_quantity").notNull().default(0),
    lostQuantity: integer("lost_quantity").notNull().default(0),
    borrowerVisible: integer("borrower_visible", { mode: "boolean" }).notNull().default(false),
    data: text("data", { mode: "json" }).notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("inventory_class_visibility").on(table.equipmentClass, table.borrowerVisible),
    check(
      "inventory_stock_conservation",
      sql`${table.totalQuantity} = ${table.availableQuantity} + ${table.allocatedQuantity} + ${table.borrowedQuantity} + ${table.damagedQuantity} + ${table.maintenanceQuantity} + ${table.lostQuantity}`
    ),
    check("inventory_timestamp_nonnegative", sql`${table.updatedAt} >= 0`),
  ]
);

export const inventoryAssets = sqliteTable(
  "inventory_assets",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),
    serialNumber: text("serial_number").notNull(),
    state: text("state").notNull(),
    data: text("data", { mode: "json" }).notNull(),
  },
  (table) => [
    uniqueIndex("inventory_asset_serial").on(table.serialNumber),
    index("asset_item_state").on(table.itemId, table.state),
    check(
      "asset_state_valid",
      sql`${table.state} IN ('AVAILABLE','ALLOCATED','BORROWED','DAMAGED','MAINTENANCE','LOST')`
    ),
  ]
);

export const requests = sqliteTable(
  "requests",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id),
    status: text("status").notNull(),
    createdAt: integer("created_at").notNull(),
    data: text("data", { mode: "json" }).notNull(),
  },
  (table) => [
    index("requests_owner_created").on(table.userId, table.createdAt),
    index("requests_status").on(table.status),
    check("request_no_invalid_sentinel", sql`${table.status} <> 'INVALID'`),
  ]
);

export const requestLines = sqliteTable(
  "request_lines",
  {
    id: text("id").primaryKey(),
    requestId: text("request_id")
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    itemId: text("item_id")
      .notNull()
      .references(() => inventory.id),
    equipmentClass: text("equipment_class").notNull(),
    quantity: integer("quantity").notNull(),
    data: text("data", { mode: "json" }).notNull(),
  },
  (table) => [index("request_lines_item").on(table.itemId)]
);

export const recordStore = sqliteTable(
  "record_store",
  {
    kind: text("kind").notNull(),
    id: text("id").notNull(),
    ownerId: text("owner_id"),
    status: text("status"),
    expiresAt: integer("expires_at"),
    data: text("data", { mode: "json" }).notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => [
    index("record_owner_kind").on(table.kind, table.ownerId),
    index("record_status_kind").on(table.kind, table.status),
    index("record_expiry").on(table.kind, table.expiresAt),
    check("record_timestamp_nonnegative", sql`${table.updatedAt} >= 0`),
  ]
);

export const staffChallenges = sqliteTable(
  "staff_challenges",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    expiresAt: integer("expires_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    consumedAt: integer("consumed_at"),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("staff_challenge_expiry").on(table.userId, table.expiresAt)]
);

export const staffSessions = sqliteTable("staff_sessions", {
  userId: text("user_id")
    .primaryKey()
    .references(() => appUsers.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
  freshUntil: integer("fresh_until").notNull(),
  revokedAt: integer("revoked_at"),
});

export const idempotencyKeys = sqliteTable(
  "idempotency_keys",
  {
    key: text("key").primaryKey(),
    actorId: text("actor_id").notNull(),
    response: text("response", { mode: "json" }).notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idempotency_created").on(table.createdAt)]
);

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(),
    reason: text("reason"),
    createdAt: integer("created_at").notNull(),
    data: text("data", { mode: "json" }).notNull(),
  },
  (table) => [
    index("audit_entity").on(table.entityType, table.entityId, table.createdAt),
    index("audit_actor").on(table.actorUserId, table.createdAt),
  ]
);

export const rateLimitBuckets = sqliteTable("rate_limit_buckets", {
  keyHash: text("key_hash").primaryKey(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull(),
});

export const registrationIntents = sqliteTable("registration_intents", {
  email: text("email").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  claimedAffiliation: text("claimed_affiliation").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
