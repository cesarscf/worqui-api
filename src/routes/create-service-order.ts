import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { serviceAddresses, serviceCategories, serviceOrders } from "@/db/schema"
import { customerAuthMiddleware } from "@/middlewares/customer-auth-middleware"
import { errorSchemas, NotFoundError } from "@/utils/error-handler"

export async function createServiceOrder(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/service-orders",
    {
      preHandler: [customerAuthMiddleware],
      schema: {
        tags: ["Service Orders"],
        summary: "Create a service order",
        security: [{ bearerAuth: [] }],
        body: z.object({
          categoryId: z.uuid(),
          title: z.string().min(3).max(255),
          description: z.string().optional(),
          postalCode: z.string().min(8).max(10),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      const sub = await request.getCurrentCustomerId()
      const { categoryId, title, description, postalCode } = request.body

      const category = await db.query.serviceCategories.findFirst({
        where: eq(serviceCategories.id, categoryId),
      })

      if (!category) {
        throw new NotFoundError("Service category not found")
      }

      const [serviceOrder] = await db
        .insert(serviceOrders)
        .values({
          customerId: sub,
          categoryId,
          title,
          description: description || null,
          status: "pending",
        })
        .returning()

      await db
        .insert(serviceAddresses)
        .values({
          serviceOrderId: serviceOrder.id,
          postalCode,
        })
        .returning()

      return reply.status(204).send()
    },
  )
}
