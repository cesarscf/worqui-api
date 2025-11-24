import { relations } from "drizzle-orm"
import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partnerServiceCategories } from "./partner-service-categories"
import { proposals } from "./proposals"

export const partners = pgTable("professionals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  expertise: text("expertise"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  ...lifecycleDates,
})

export const partnersRelations = relations(partners, ({ many }) => ({
  serviceCategories: many(partnerServiceCategories),
  proposals: many(proposals),
}))
