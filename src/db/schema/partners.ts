import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"

export const partners = pgTable("partners", {
  id: uuid("id").primaryKey().defaultRandom(),
  phoneNumber: text("phone_number").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").unique(),
  emailVerifiedAt: timestamp("email_verified_at"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  ...lifecycleDates,
})
