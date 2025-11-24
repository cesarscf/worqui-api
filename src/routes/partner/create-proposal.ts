import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partnerServiceCategories, proposals, serviceOrders } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function createProposal(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/proposals",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Proposals"],
        summary: "Create a proposal for a service order",
        security: [{ bearerAuth: [] }],
        body: z.object({
          serviceOrderId: z.uuid(),
          priceInCents: z.number().int().positive(),
          message: z.string().optional(),
        }),
        response: {
          201: z.object({
            id: z.string(),
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
          return reply
            .status(404)
            .send({ message: "Pedido de serviço não encontrado" })
        }

        if (serviceOrder.status !== "pending") {
          return reply.status(400).send({
            message: "Pedido de serviço não está mais aceitando propostas",
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
              "Você não tem autorização para propor esta categoria de serviço",
          })
        }

        const existingProposal = await db.query.proposals.findFirst({
          where: and(
            eq(proposals.serviceOrderId, serviceOrderId),
            eq(proposals.partnerId, partnerId),
          ),
        })

        if (existingProposal) {
          return reply.status(409).send({
            message: "Você já criou uma proposta para este pedido de serviço",
          })
        }

        const [newProposal] = await db
          .insert(proposals)
          .values({
            serviceOrderId,
            partnerId,
            priceInCents,
            message: message || null,
            status: "pending",
          })
          .returning({ id: proposals.id })

        return reply.status(201).send({ id: newProposal.id })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
