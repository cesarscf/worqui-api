import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { serviceOrders } from "./service-orders"

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull().unique(),
  ...lifecycleDates,
})

export const customersRelations = relations(customers, ({ many }) => ({
  serviceOrders: many(serviceOrders),
}))
