import { relations } from "drizzle-orm"
import { decimal, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partners } from "./partners"
import { serviceOrders } from "./service-orders"

export const proposalStatusEnum = pgEnum("proposal_status", [
  "pending",
  "accepted",
  "rejected",
  "counter_offer",
])

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("partner_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  serviceOrderId: uuid("service_order_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: proposalStatusEnum("status").notNull().default("pending"),
  ...lifecycleDates,
})

export const proposalsRelations = relations(proposals, ({ one }) => ({
  partner: one(partners, {
    fields: [proposals.partnerId],
    references: [partners.id],
  }),
  serviceOrder: one(serviceOrders, {
    fields: [proposals.serviceOrderId],
    references: [serviceOrders.id],
  }),
}))
