import type { FastifyInstance } from "fastify"
import z from "zod"
import { db } from "@/db"
import { serviceCategories } from "@/db/schema"
import { errorSchemas } from "@/utils/error-handler"

export async function getServiceCategories(app: FastifyInstance) {
  app.get(
    "/service-categories",
    {
      schema: {
        tags: ["Service Categories"],
        summary: "List all service categories",
        response: {
          200: z.object({
            categories: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                description: z.string().nullable(),
              }),
            ),
          }),
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (_, reply) => {
      const categories = await db.select().from(serviceCategories)

      return reply.status(200).send({ categories })
    },
  )
}
