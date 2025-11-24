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
        summary: "Get authenticated partner profile",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.object({
            id: z.uuid(),
            name: z.string(),
            email: z.string().nullable(),
            phone: z.string(),
            expertise: z.string().nullable(),
            phoneVerifiedAt: z.date().nullable(),
            emailVerifiedAt: z.date().nullable(),
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

        const [partner] = await db
          .select()
          .from(partners)
          .where(eq(partners.id, partnerId))

        if (!partner) {
          return reply.status(404).send({
            message: "Usuário não encontrado",
          })
        }

        return reply.status(200).send(partner)
      } catch {
        return reply.status(500).send({
          message: "Erro interno do servidor",
        })
      }
    },
  )
}
