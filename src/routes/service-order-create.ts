import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { customers, serviceOrders, verifications } from "@/db/schema"
import { errorSchemas } from "@/utils/error-schemas"

export async function serviceOrderCreate(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/service-orders",
    {
      schema: {
        tags: ["Service Orders"],
        summary: "Create a new service order after WhatsApp verification",
        body: z.object({
          phoneNumber: z.string().min(10).max(20),
          code: z.string().length(6),
        }),
        response: {
          201: z.object({
            id: z.uuid(),
            customerId: z.uuid(),
            message: z.string(),
          }),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const { phoneNumber, code } = request.body

        const verification = await db.query.verifications.findFirst({
          where: and(
            eq(verifications.identifier, phoneNumber),
            eq(verifications.value, code),
          ),
        })

        if (!verification) {
          return reply
            .status(401)
            .send({ message: "Código de verificação inválido" })
        }

        if (verification.expiresAt < new Date()) {
          await db
            .delete(verifications)
            .where(eq(verifications.id, verification.id))

          return reply
            .status(401)
            .send({ message: "Código de verificação expirado" })
        }

        if (!verification.metadata) {
          return reply.status(401).send({
            message: "Verificação inválida: dados da solicitação ausentes",
          })
        }

        const metadata = verification.metadata as {
          name: string
          zipCode: string
          deviceBrand: string
          warrantyStatus: string
          serviceType: string
          issueCategory: string
          urgencyLevel: string
          additionalInfo?: string
        }

        if (
          !metadata.name ||
          !metadata.zipCode ||
          !metadata.deviceBrand ||
          !metadata.warrantyStatus ||
          !metadata.serviceType ||
          !metadata.issueCategory ||
          !metadata.urgencyLevel
        ) {
          return reply.status(401).send({
            message: "Verificação inválida: dados da solicitação incompletos",
          })
        }

        let customer = await db.query.customers.findFirst({
          where: eq(customers.whatsapp, phoneNumber),
        })

        if (!customer) {
          const [newCustomer] = await db
            .insert(customers)
            .values({
              name: metadata.name,
              whatsapp: phoneNumber,
            })
            .returning()

          customer = newCustomer
        } else {
          const [updatedCustomer] = await db
            .update(customers)
            .set({ name: metadata.name })
            .where(eq(customers.id, customer.id))
            .returning()

          customer = updatedCustomer
        }

        const [serviceOrder] = await db
          .insert(serviceOrders)
          .values({
            customerId: customer.id,
            zipCode: metadata.zipCode,
            deviceBrand: metadata.deviceBrand,
            warrantyStatus: metadata.warrantyStatus,
            serviceType: metadata.serviceType,
            issueCategory: metadata.issueCategory,
            urgencyLevel: metadata.urgencyLevel,
            additionalInfo: metadata.additionalInfo,
          })
          .returning()

        await db
          .delete(verifications)
          .where(eq(verifications.id, verification.id))

        return reply.status(201).send({
          id: serviceOrder.id,
          customerId: customer.id,
          message: "Solicitação de serviço criada com sucesso",
        })
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
