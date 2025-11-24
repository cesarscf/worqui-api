import { and, eq, ne } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { proposals, serviceOrders } from "@/db/schema"
import { customerAuthMiddleware } from "@/middlewares/customer-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function acceptProposal(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/proposals/:id/accept",
    {
      preHandler: [customerAuthMiddleware],
      schema: {
        tags: ["Proposals"],
        summary: "Accept a proposal for a service order",
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

        const proposal = await db.query.proposals.findFirst({
          where: eq(proposals.id, id),
          with: {
            serviceOrder: true,
          },
        })

        if (!proposal) {
          return reply.status(404).send({ message: "Proposta não encontrada" })
        }

        if (proposal.serviceOrder.customerId !== customerId) {
          return reply.status(403).send({
            message: "Você não tem autorização para aceitar esta proposta",
          })
        }

        if (proposal.status !== "pending") {
          return reply
            .status(400)
            .send({ message: "Esta proposta já foi processada" })
        }

        if (proposal.serviceOrder.status !== "pending") {
          return reply.status(400).send({
            message: "Este pedido de serviço não está mais aceitando propostas",
          })
        }

        await db.transaction(async (tx) => {
          await tx
            .update(proposals)
            .set({ status: "accepted" })
            .where(eq(proposals.id, id))

          await tx
            .update(proposals)
            .set({ status: "rejected" })
            .where(
              and(
                eq(proposals.serviceOrderId, proposal.serviceOrderId),
                ne(proposals.id, id),
              ),
            )
          await tx
            .update(serviceOrders)
            .set({ status: "in_progress" })
            .where(eq(serviceOrders.id, proposal.serviceOrderId))
        })

        return reply.status(204).send()
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
