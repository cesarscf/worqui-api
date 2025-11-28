import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { serviceOrders } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function getServiceOrder(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/service-orders/:id",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Service Orders"],
        summary: "Get a specific service order by ID",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            customerId: z.uuid(),
            zipCode: z.string(),
            deviceBrand: z.string(),
            warrantyStatus: z.string(),
            serviceType: z.string(),
            issueCategory: z.string(),
            urgencyLevel: z.string(),
            additionalInfo: z.string().nullable(),
            status: z.enum([
              "pending",
              "in_progress",
              "completed",
              "cancelled",
            ]),
            createdAt: z.date(),
            updatedAt: z.date(),
          }),
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        await request.getCurrentPartnerId()
        const { id } = request.params

        const serviceOrder = await db.query.serviceOrders.findFirst({
          where: eq(serviceOrders.id, id),
        })

        if (!serviceOrder) {
          return reply.status(404).send({
            message: "Ordem de serviço não encontrada",
          })
        }

        const data = {
          id: serviceOrder.id,
          customerId: serviceOrder.customerId,
          zipCode: serviceOrder.zipCode,
          deviceBrand: serviceOrder.deviceBrand,
          warrantyStatus: serviceOrder.warrantyStatus,
          serviceType: serviceOrder.serviceType,
          issueCategory: serviceOrder.issueCategory,
          urgencyLevel: serviceOrder.urgencyLevel,
          additionalInfo: serviceOrder.additionalInfo,
          status: serviceOrder.status,
          createdAt: serviceOrder.createdAt,
          updatedAt: serviceOrder.updatedAt,
        }

        return reply.status(200).send(data)
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
