import { relations } from "drizzle-orm"
import { pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { customers } from "./customers"

export const serviceOrderStatusEnum = pgEnum("service_order_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
])

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  zipCode: text("zip_code").notNull(),
  deviceBrand: text("device_brand").notNull(),
  warrantyStatus: text("warranty_status").notNull(),
  serviceType: text("service_type").notNull(),
  issueCategory: text("issue_category").notNull(),
  urgencyLevel: text("urgency_level").notNull(),
  additionalInfo: text("additional_info"),
  status: serviceOrderStatusEnum("status").notNull().default("pending"),
  ...lifecycleDates,
})

export const serviceOrdersRelations = relations(serviceOrders, ({ one }) => ({
  customer: one(customers, {
    fields: [serviceOrders.customerId],
    references: [customers.id],
  }),
}))
