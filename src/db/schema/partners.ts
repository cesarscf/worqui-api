import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"

export const partners = pgTable("professionals", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerifiedAt: timestamp("email_verified_at"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  ...lifecycleDates,
})
