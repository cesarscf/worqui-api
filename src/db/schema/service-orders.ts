import { relations } from "drizzle-orm"
import { pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { customers } from "./customers"
import { proposals } from "./proposals"
import { serviceCategories } from "./service-categories"

export const serviceOrderStatusValues = [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
] as const

export const serviceOrderStatusEnum = pgEnum(
  "service_order_status",
  serviceOrderStatusValues,
)

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  status: serviceOrderStatusEnum("status").notNull().default("pending"),

  ...lifecycleDates,
})

export const serviceOrdersRelations = relations(
  serviceOrders,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [serviceOrders.customerId],
      references: [customers.id],
    }),
    category: one(serviceCategories, {
      fields: [serviceOrders.categoryId],
      references: [serviceCategories.id],
    }),
    proposals: many(proposals),
  }),
)
