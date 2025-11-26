import { relations } from "drizzle-orm"
import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { customers } from "./customers"

export const serviceOrderStatusEnum = pgEnum("service_order_status", [
  "open",
  "closed",
  "cancelled",
])

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  zipCode: varchar("zip_code", { length: 10 }).notNull(),
  deviceBrand: text("device_brand").notNull(),
  warrantyStatus: text("warranty_status").notNull(),
  serviceType: text("service_type").notNull(),
  issueCategory: text("issue_category").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  additionalInfo: text("additional_info"),
  status: serviceOrderStatusEnum("status").notNull().default("open"),
  ...lifecycleDates,
})

export const serviceOrdersRelations = relations(serviceOrders, ({ one }) => ({
  customer: one(customers, {
    fields: [serviceOrders.customerId],
    references: [customers.id],
  }),
}))
