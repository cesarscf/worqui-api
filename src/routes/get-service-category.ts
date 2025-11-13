import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { serviceCategories } from "@/db/schema"
import { errorSchemas } from "@/utils/error-schemas"

export async function getServiceCategory(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/service-categories/:id",
    {
      schema: {
        tags: ["Service Categories"],
        summary: "Get a service category by ID",
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            id: z.uuid(),
            name: z.string(),
            description: z.string().nullable(),
          }),
          400: errorSchemas.validationError,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params

        const [category] = await db
          .select()
          .from(serviceCategories)
          .where(eq(serviceCategories.id, id))

        if (!category) {
          return reply.status(404).send({
            message: "Service category not found",
          })
        }

        return reply.status(200).send(category)
      } catch {
        return reply.status(500).send({
          message: "Internal server error",
        })
      }
    },
  )
}
