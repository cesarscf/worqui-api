import { relations } from "drizzle-orm"
import { pgTable, text, uuid, varchar } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partnerServiceCategories } from "./partner-service-categories"
import { serviceOrders } from "./service-orders"

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ...lifecycleDates,
})

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ many }) => ({
    partnerServiceCategories: many(partnerServiceCategories),
    serviceOrders: many(serviceOrders),
  }),
)
