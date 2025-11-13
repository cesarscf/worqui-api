import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import {
  partnerServiceCategories,
  quotations,
  serviceOrders,
} from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function createQuotation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/quotations",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Quotations"],
        summary: "Create a quotation for a service order",
        security: [{ bearerAuth: [] }],
        body: z.object({
          serviceOrderId: z.uuid(),
          priceInCents: z.number().int().positive(),
          message: z.string().optional(),
        }),
        response: {
          201: z.object({
            quotationId: z.string(),
          }),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          409: errorSchemas.conflict,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const partnerId = await request.getCurrentPartnerId()
        const { serviceOrderId, priceInCents, message } = request.body

        const serviceOrder = await db.query.serviceOrders.findFirst({
          where: eq(serviceOrders.id, serviceOrderId),
          with: {
            category: true,
          },
        })

        if (!serviceOrder) {
          return reply.status(404).send({ message: "Service order not found" })
        }

        if (serviceOrder.status !== "pending") {
          return reply.status(400).send({
            message: "Service order is no longer accepting quotations",
          })
        }

        const partnerCategory =
          await db.query.partnerServiceCategories.findFirst({
            where: and(
              eq(partnerServiceCategories.partnerId, partnerId),
              eq(partnerServiceCategories.categoryId, serviceOrder.categoryId),
            ),
          })

        if (!partnerCategory) {
          return reply.status(403).send({
            message:
              "You are not authorized to quote for this service category",
          })
        }

        const existingQuotation = await db.query.quotations.findFirst({
          where: and(
            eq(quotations.serviceOrderId, serviceOrderId),
            eq(quotations.partnerId, partnerId),
          ),
        })

        if (existingQuotation) {
          return reply.status(409).send({
            message: "You already created a quotation for this service order",
          })
        }

        const [newQuotation] = await db
          .insert(quotations)
          .values({
            serviceOrderId,
            partnerId,
            priceInCents,
            message: message || null,
            status: "pending",
          })
          .returning({ id: quotations.id })

        return reply.status(201).send({ quotationId: newQuotation.id })
      } catch {
        return reply.status(500).send({ message: "Internal server error" })
      }
    },
  )
}
