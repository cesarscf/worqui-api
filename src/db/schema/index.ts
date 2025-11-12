import { relations } from "drizzle-orm"
import {
  decimal,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { lifecycleDates } from "../utils"

export const serviceCategories = pgTable("service_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ...lifecycleDates,
})

export const professionals = pgTable("professionals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  expertise: text("expertise"),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  ...lifecycleDates,
})

export const professionalCoverage = pgTable("professional_coverage", {
  id: uuid("id").primaryKey().defaultRandom(),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  radiusKm: decimal("radius_km", { precision: 6, scale: 2 }),
  ...lifecycleDates,
})

export const professionalServiceCategories = pgTable(
  "professional_service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    professionalId: uuid("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade" }),
  },
)

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  ...lifecycleDates,
})

export const requests = pgTable("requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  ...lifecycleDates,
})

export const serviceAddresses = pgTable("service_addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 255 }),
  city: varchar("city", { length: 255 }),
  state: varchar("state", { length: 2 }),
  postalCode: varchar("postal_code", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  ...lifecycleDates,
})

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id, { onDelete: "cascade" }),
  professionalId: uuid("professional_id")
    .notNull()
    .references(() => professionals.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  ...lifecycleDates,
})

export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: varchar("identifier", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  ...lifecycleDates,
})

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ many }) => ({
    professionalServiceCategories: many(professionalServiceCategories),
    requests: many(requests),
  }),
)

export const professionalsRelations = relations(professionals, ({ many }) => ({
  coverage: many(professionalCoverage),
  serviceCategories: many(professionalServiceCategories),
  quotations: many(quotations),
}))

export const professionalCoverageRelations = relations(
  professionalCoverage,
  ({ one }) => ({
    professional: one(professionals, {
      fields: [professionalCoverage.professionalId],
      references: [professionals.id],
    }),
  }),
)

export const professionalServiceCategoriesRelations = relations(
  professionalServiceCategories,
  ({ one }) => ({
    professional: one(professionals, {
      fields: [professionalServiceCategories.professionalId],
      references: [professionals.id],
    }),
    category: one(serviceCategories, {
      fields: [professionalServiceCategories.categoryId],
      references: [serviceCategories.id],
    }),
  }),
)

export const customersRelations = relations(customers, ({ many }) => ({
  requests: many(requests),
}))

export const requestsRelations = relations(requests, ({ one, many }) => ({
  customer: one(customers, {
    fields: [requests.customerId],
    references: [customers.id],
  }),
  category: one(serviceCategories, {
    fields: [requests.categoryId],
    references: [serviceCategories.id],
  }),
  address: one(serviceAddresses),
  quotations: many(quotations),
}))

export const serviceAddressesRelations = relations(
  serviceAddresses,
  ({ one }) => ({
    request: one(requests, {
      fields: [serviceAddresses.requestId],
      references: [requests.id],
    }),
  }),
)

export const quotationsRelations = relations(quotations, ({ one }) => ({
  request: one(requests, {
    fields: [quotations.requestId],
    references: [requests.id],
  }),
  professional: one(professionals, {
    fields: [quotations.professionalId],
    references: [professionals.id],
  }),
}))
