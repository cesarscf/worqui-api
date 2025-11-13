import { and, eq, ne } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { quotations, serviceOrders } from "@/db/schema"
import { customerAuthMiddleware } from "@/middlewares/customer-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function acceptQuotation(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/quotations/:id/accept",
    {
      preHandler: [customerAuthMiddleware],
      schema: {
        tags: ["Quotations"],
        summary: "Accept a quotation for a service order",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          403: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const customerId = await request.getCurrentCustomerId()
        const { id } = request.params

        const quotation = await db.query.quotations.findFirst({
          where: eq(quotations.id, id),
          with: {
            serviceOrder: true,
          },
        })

        if (!quotation) {
          return reply.status(404).send({ message: "Quotation not found" })
        }

        if (quotation.serviceOrder.customerId !== customerId) {
          return reply.status(403).send({
            message: "You are not authorized to accept this quotation",
          })
        }

        if (quotation.status !== "pending") {
          return reply
            .status(400)
            .send({ message: "This quotation has already been processed" })
        }

        if (quotation.serviceOrder.status !== "pending") {
          return reply.status(400).send({
            message: "This service order is no longer accepting quotations",
          })
        }

        await db.transaction(async (tx) => {
          await tx
            .update(quotations)
            .set({ status: "accepted" })
            .where(eq(quotations.id, id))

          await tx
            .update(quotations)
            .set({ status: "rejected" })
            .where(
              and(
                eq(quotations.serviceOrderId, quotation.serviceOrderId),
                ne(quotations.id, id),
              ),
            )
          await tx
            .update(serviceOrders)
            .set({ status: "in_progress" })
            .where(eq(serviceOrders.id, quotation.serviceOrderId))
        })

        return reply.status(204).send()
      } catch {
        return reply.status(500).send({ message: "Internal server error" })
      }
    },
  )
}
