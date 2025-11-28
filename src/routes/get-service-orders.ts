import { desc, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { serviceOrders } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function getServiceOrders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/service-orders",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Service Orders"],
        summary: "List available service orders for partners to send proposals",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            items: z.array(
              z.object({
                id: z.string(),
                zipCode: z.string(),
                deviceBrand: z.string(),
                warrantyStatus: z.string(),
                serviceType: z.string(),
                issueCategory: z.string(),
                urgencyLevel: z.string(),
                additionalInfo: z.string().nullable(),
                createdAt: z.date(),
              }),
            ),
          }),
          401: errorSchemas.unauthorized,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (_, reply) => {
      try {
        const items = await db.query.serviceOrders.findMany({
          where: eq(serviceOrders.status, "pending"),
          orderBy: [desc(serviceOrders.createdAt)],
          columns: {
            id: true,
            zipCode: true,
            deviceBrand: true,
            warrantyStatus: true,
            serviceType: true,
            issueCategory: true,
            urgencyLevel: true,
            additionalInfo: true,
            createdAt: true,
          },
        })

        return reply.status(200).send({
          items,
        })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
