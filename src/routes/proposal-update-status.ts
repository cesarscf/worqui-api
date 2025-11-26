import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { customers, proposals } from "@/db/schema"
import { customerAuthMiddleware } from "@/middlewares/customer-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function proposalUpdateStatus(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    "/proposals/:id",
    {
      preHandler: [customerAuthMiddleware],
      schema: {
        tags: ["Proposals"],
        summary: "Accept or reject a proposal",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.uuid(),
        }),
        body: z.object({
          accept: z.boolean(),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const customerId = await request.getCurrentCustomerId()
        const { id } = request.params
        const { accept } = request.body

        const proposal = await db.query.proposals.findFirst({
          where: eq(proposals.id, id),
          with: {
            serviceOrder: true,
            partner: true,
          },
        })

        if (!proposal) {
          return reply.status(404).send({
            message: "Proposta não encontrada",
          })
        }

        if (proposal.serviceOrder.customerId !== customerId) {
          return reply.status(403).send({
            message: "Você não tem permissão para responder a essa proposta",
          })
        }

        if (proposal.status !== "pending") {
          return reply.status(400).send({
            message: "Esta proposta já foi respondida",
          })
        }

        const newStatus = accept ? "accepted" : "rejected"

        await db
          .update(proposals)
          .set({ status: newStatus })
          .where(eq(proposals.id, id))

        if (accept) {
          const customer = await db.query.customers.findFirst({
            where: eq(customers.id, customerId),
          })

          console.log(
            `[WhatsApp] Enviar para ${customer?.phoneNumber}: O parceiro ${proposal.partner.name} aceitou sua proposta! Entre em contato: ${proposal.partner.phoneNumber}`,
          )
          console.log(
            `[WhatsApp] Enviar para ${proposal.partner.phoneNumber}: O cliente ${customer?.name} aceitou sua proposta! Entre em contato: ${customer?.phoneNumber}`,
          )
        }

        return reply.status(204).send()
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
