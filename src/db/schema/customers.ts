import { relations } from "drizzle-orm"
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { serviceOrders } from "./service-orders"

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  ...lifecycleDates,
})

export const customersRelations = relations(customers, ({ many }) => ({
  serviceOrders: many(serviceOrders),
}))
