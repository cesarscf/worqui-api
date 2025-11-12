import { relations } from "drizzle-orm"
import { decimal, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partners } from "./partners"
import { serviceOrders } from "./service-orders"

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceOrderId: uuid("request_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  partnerId: uuid("professional_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  ...lifecycleDates,
})

export const quotationsRelations = relations(quotations, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [quotations.serviceOrderId],
    references: [serviceOrders.id],
  }),
  partner: one(partners, {
    fields: [quotations.partnerId],
    references: [partners.id],
  }),
}))
