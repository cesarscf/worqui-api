import { relations } from "drizzle-orm"
import { decimal, pgTable, uuid } from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"
import { partners } from "./partners"

export const partnerCoverage = pgTable("professional_coverage", {
  id: uuid("id").primaryKey().defaultRandom(),
  partnerId: uuid("professional_id")
    .notNull()
    .references(() => partners.id, { onDelete: "cascade" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  radiusKm: decimal("radius_km", { precision: 6, scale: 2 }),
  ...lifecycleDates,
})

export const partnerCoverageRelations = relations(
  partnerCoverage,
  ({ one }) => ({
    partner: one(partners, {
      fields: [partnerCoverage.partnerId],
      references: [partners.id],
    }),
  }),
)
