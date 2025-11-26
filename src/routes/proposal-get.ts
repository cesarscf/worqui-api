import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { proposals } from "@/db/schema"
import { customerAuthMiddleware } from "@/middlewares/customer-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function proposalGet(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/proposals/:id",
    {
      preHandler: [customerAuthMiddleware],
      schema: {
        tags: ["Proposals"],
        summary: "Get proposal details",
        security: [{ bearerAuth: [] }],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            serviceOrderId: z.uuid(),
            partnerId: z.uuid(),
            description: z.string(),
            price: z.string(),
            status: z.enum([
              "pending",
              "accepted",
              "rejected",
              "counter_offer",
            ]),
            createdAt: z.date(),
            partner: z.object({
              id: z.uuid(),
              name: z.string(),
            }),
            serviceOrder: z.object({
              id: z.uuid(),
              customerId: z.uuid(),
              zipCode: z.string(),
              deviceBrand: z.string(),
              warrantyStatus: z.string(),
              serviceType: z.string(),
              issueCategory: z.string(),
              urgencyLevel: z.string(),
              additionalInfo: z.string().nullable(),
              status: z.enum(["open", "closed", "cancelled"]),
            }),
          }),
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

        const proposal = await db.query.proposals.findFirst({
          where: eq(proposals.id, id),
          with: {
            partner: true,
            serviceOrder: true,
          },
        })

        if (!proposal) {
          return reply.status(404).send({
            message: "Proposta não encontrada",
          })
        }

        if (proposal.serviceOrder.customerId !== customerId) {
          return reply.status(403).send({
            message: "Você não tem permissão para ver essa proposta",
          })
        }

        return reply.send({
          id: proposal.id,
          serviceOrderId: proposal.serviceOrderId,
          partnerId: proposal.partnerId,
          description: proposal.description,
          price: proposal.price,
          status: proposal.status,
          createdAt: proposal.createdAt,
          partner: {
            id: proposal.partner.id,
            name: proposal.partner.name,
          },
          serviceOrder: {
            id: proposal.serviceOrder.id,
            customerId: proposal.serviceOrder.customerId,
            zipCode: proposal.serviceOrder.zipCode,
            deviceBrand: proposal.serviceOrder.deviceBrand,
            warrantyStatus: proposal.serviceOrder.warrantyStatus,
            serviceType: proposal.serviceOrder.serviceType,
            issueCategory: proposal.serviceOrder.issueCategory,
            urgencyLevel: proposal.serviceOrder.urgencyLevel,
            additionalInfo: proposal.serviceOrder.additionalInfo,
            status: proposal.serviceOrder.status,
          },
        })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
