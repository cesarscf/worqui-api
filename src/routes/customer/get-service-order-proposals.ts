import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { proposals, serviceOrders } from "@/db/schema"
import { customerAuthMiddleware } from "@/middlewares/customer-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function getServiceOrderProposals(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/service-orders/:id/proposals",
    {
      preHandler: [customerAuthMiddleware],
      schema: {
        tags: ["Service Orders"],
        summary: "List proposals for a service order",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            items: z.array(
              z.object({
                id: z.string(),
                priceInCents: z.number().int(),
                message: z.string().nullable(),
                status: z.string(),
                createdAt: z.date(),
                partner: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string().nullable(),
                  expertise: z.string().nullable(),
                }),
              }),
            ),
          }),
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

        const serviceOrder = await db.query.serviceOrders.findFirst({
          where: and(eq(serviceOrders.id, id), eq(serviceOrders, customerId)),
        })

        if (!serviceOrder) {
          return reply
            .status(404)
            .send({ message: "Pedido de serviço não encontrado" })
        }

        if (serviceOrder.customerId !== customerId) {
          return reply.status(403).send({
            message: "Você não tem autorização para ver estas propostas",
          })
        }

        const proposalsList = await db.query.proposals.findMany({
          where: eq(proposals.serviceOrderId, serviceOrder.id),
          with: {
            partner: {
              columns: {
                id: true,
                name: true,
                email: true,
                expertise: true,
              },
            },
          },
        })

        return reply.status(200).send({ items: proposalsList })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
