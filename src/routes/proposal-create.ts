import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { proposals, serviceOrders } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { centsToBRL } from "@/utils"
import { errorSchemas } from "@/utils/error-schemas"

export async function proposalCreate(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/proposals",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Proposals"],
        summary: "Create a new proposal for a service order",
        security: [{ bearerAuth: [] }],
        body: z.object({
          serviceOrderId: z.uuid(),
          priceInCents: z.string(),
          description: z.string().min(10).max(1000),
        }),
        response: {
          201: z.object({
            id: z.uuid(),
          }),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const partnerId = await request.getCurrentPartnerId()
        const { serviceOrderId, priceInCents, description } = request.body

        const serviceOrder = await db.query.serviceOrders.findFirst({
          where: eq(serviceOrders.id, serviceOrderId),
        })

        if (!serviceOrder) {
          return reply.status(404).send({
            message: "Ordem de serviço não encontrada",
          })
        }

        const [proposal] = await db
          .insert(proposals)
          .values({
            partnerId,
            serviceOrderId,
            price: centsToBRL(priceInCents),
            description,
            status: "pending",
          })
          .returning()

        return reply.status(201).send({
          id: proposal.id,
        })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
