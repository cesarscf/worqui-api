import { relations } from "drizzle-orm"
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { serviceOrders } from "./service-orders"

export const serviceAddresses = pgTable("service_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceOrderId: uuid("request_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  postalCode: varchar("postal_code", { length: 10 }).notNull(),
  ...lifecycleDates,
})

export const serviceAddressesRelations = relations(
  serviceAddresses,
  ({ one }) => ({
    serviceOrder: one(serviceOrders, {
      fields: [serviceAddresses.serviceOrderId],
      references: [serviceOrders.id],
    }),
  }),
)
