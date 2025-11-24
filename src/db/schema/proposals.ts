import { relations } from "drizzle-orm"
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partners } from "./partners"
import { serviceOrders } from "./service-orders"

export const proposalStatusValues = ["pending", "accepted", "rejected"] as const

export const proposalStatusEnum = pgEnum(
  "proposal_status",
  proposalStatusValues,
)

export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceOrderId: uuid("request_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  partnerId: uuid("professional_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  priceInCents: integer("price_in_cents").notNull(),
  message: text("message"),
  status: proposalStatusEnum("status").notNull().default("pending"),
  ...lifecycleDates,
})

export const proposalsRelations = relations(proposals, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [proposals.serviceOrderId],
    references: [serviceOrders.id],
  }),
  partner: one(partners, {
    fields: [proposals.partnerId],
    references: [partners.id],
  }),
}))
