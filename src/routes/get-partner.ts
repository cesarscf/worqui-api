import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partners } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function getPartner(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/partners/me",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Partners"],
        summary: "Get authenticated partner data",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            id: z.uuid(),
            name: z.string(),
            email: z.string().nullable(),
            phoneNumber: z.string(),
            emailVerifiedAt: z.date().nullable(),
            phoneVerifiedAt: z.date().nullable(),
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
        const partnerId = await request.getCurrentPartnerId()

        const partner = await db.query.partners.findFirst({
          where: eq(partners.id, partnerId),
        })

        if (!partner) {
          return reply.status(404).send({
            message: "Partner não encontrado",
          })
        }

        const data = {
          id: partner.id,
          name: partner.name,
          email: partner.email,
          phoneNumber: partner.phoneNumber,
          emailVerifiedAt: partner.emailVerifiedAt,
          phoneVerifiedAt: partner.phoneVerifiedAt,
          createdAt: partner.createdAt,
          updatedAt: partner.updatedAt,
        }

        return reply.status(200).send(data)
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
