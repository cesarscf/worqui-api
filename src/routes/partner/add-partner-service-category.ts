import { eq, inArray } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partnerServiceCategories, serviceCategories } from "@/db/schema"
import { partnerAuthMiddleware } from "@/middlewares/partner-auth-middleware"
import { errorSchemas } from "@/utils/error-schemas"

export async function addPartnerServiceCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/partners/service-categories",
    {
      preHandler: [partnerAuthMiddleware],
      schema: {
        tags: ["Partners"],
        summary: "Replace all partner service categories",
        security: [{ bearerAuth: [] }],
        body: z.object({
          categoryIds: z.array(z.string().uuid("Invalid UUID format")).min(1),
        }),
        response: {
          201: z.void(),
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
        const { categoryIds } = request.body

        const categories = await db.query.serviceCategories.findMany({
          where: inArray(serviceCategories.id, categoryIds),
        })

        if (categories.length !== categoryIds.length) {
          return reply
            .status(404)
            .send({
              message: "Uma ou mais categorias de serviço não encontradas",
            })
        }

        await db
          .delete(partnerServiceCategories)
          .where(eq(partnerServiceCategories.partnerId, partnerId))

        await db.insert(partnerServiceCategories).values(
          categoryIds.map((categoryId) => ({
            partnerId,
            categoryId,
          })),
        )

        return reply.status(201).send()
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
