import { eq, inArray } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partnerServiceCategories, serviceOrders } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function getPartnerServiceOrders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/partners/service-orders",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Partners"],
        summary: "List service orders available for partner",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            items: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                description: z.string().nullable(),
                postalCode: z.string(),
                status: z.string(),
                createdAt: z.date(),
                category: z.object({
                  id: z.string(),
                  name: z.string(),
                  description: z.string().nullable(),
                }),
                customer: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
              }),
            ),
          }),
          401: errorSchemas.unauthorized,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const partnerId = await request.getCurrentPartnerId()

        const partnerCategories =
          await db.query.partnerServiceCategories.findMany({
            where: eq(partnerServiceCategories.partnerId, partnerId),
            columns: {
              categoryId: true,
            },
          })

        if (partnerCategories.length === 0) {
          return reply.status(200).send({ items: [] })
        }

        const categoryIds = partnerCategories.map((pc) => pc.categoryId)

        const orders = await db.query.serviceOrders.findMany({
          where: inArray(serviceOrders.categoryId, categoryIds),
          with: {
            category: {
              columns: {
                id: true,
                name: true,
                description: true,
              },
            },
            customer: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        })

        return reply.status(200).send({ items: orders })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
