import { relations } from "drizzle-orm"
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partners } from "./partners"
import { serviceOrders } from "./service-orders"

export const quotationStatusValues = [
  "pending",
  "accepted",
  "rejected",
] as const

export const quotationStatusEnum = pgEnum(
  "quotation_status",
  quotationStatusValues,
)

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceOrderId: uuid("request_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  partnerId: uuid("professional_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  priceInCents: integer("price_in_cents").notNull(),
  message: text("message"),
  status: quotationStatusEnum("status").notNull().default("pending"),
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
