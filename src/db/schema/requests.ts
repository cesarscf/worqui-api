import { relations } from "drizzle-orm"
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { customers } from "./customers"
import { quotations } from "./quotations"
import { serviceAddresses } from "./service-addresses"
import { serviceCategories } from "./service-categories"

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  ...lifecycleDates,
})

export const requestsRelations = relations(requests, ({ one, many }) => ({
  customer: one(customers, {
    fields: [requests.customerId],
    references: [customers.id],
  }),
  category: one(serviceCategories, {
    fields: [requests.categoryId],
    references: [serviceCategories.id],
  }),
  address: one(serviceAddresses),
  quotations: many(quotations),
}))
