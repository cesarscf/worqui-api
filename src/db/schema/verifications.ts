import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  metadata: jsonb("metadata"),
  ...lifecycleDates,
})
