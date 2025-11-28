import { relations } from "drizzle-orm"
import { pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { serviceOrders } from "./service-orders"

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phoneNumber: text("phone_number").notNull().unique(),
  ...lifecycleDates,
})

export const customersRelations = relations(customers, ({ many }) => ({
  serviceOrders: many(serviceOrders),
}))
