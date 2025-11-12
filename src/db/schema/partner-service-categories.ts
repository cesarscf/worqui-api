import { relations } from "drizzle-orm"
import { pgTable, uuid } from "drizzle-orm/pg-core"
import { partners } from "./partners"
import { serviceCategories } from "./service-categories"

export const partnerServiceCategories = pgTable(
  "professional_service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    partnerId: uuid("professional_id")
      .notNull()
      .references(() => partners.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade" }),
  },
)

export const partnerServiceCategoriesRelations = relations(
  partnerServiceCategories,
  ({ one }) => ({
    partner: one(partners, {
      fields: [partnerServiceCategories.partnerId],
      references: [partners.id],
    }),
    category: one(serviceCategories, {
      fields: [partnerServiceCategories.categoryId],
      references: [serviceCategories.id],
    }),
  }),
)
