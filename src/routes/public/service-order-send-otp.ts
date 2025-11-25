import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { verifications } from "@/db/schema"
import { errorSchemas } from "@/utils/error-schemas"

export async function serviceOrderSendOtp(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/service-orders/send-top",
    {
      schema: {
        tags: ["Service Orders"],
        summary: "Send OTP code to WhatsApp for service order creation",
        body: z.object({
          name: z.string().min(3).max(255),
          phoneNumber: z.string().min(10).max(20),
          zipCode: z.string().min(8).max(10),
          deviceBrand: z.string().min(1),
          warrantyStatus: z.string().min(1),
          serviceType: z.string().min(1),
          issueCategory: z.string().min(1),
          urgencyLevel: z.string().min(1),
          additionalInfo: z.string().optional(),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const {
          name,
          phoneNumber,
          zipCode,
          deviceBrand,
          warrantyStatus,
          serviceType,
          issueCategory,
          urgencyLevel,
          additionalInfo,
        } = request.body

        const code = Math.floor(100000 + Math.random() * 900000).toString()

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await db
          .delete(verifications)
          .where(eq(verifications.identifier, phoneNumber))

        await db.insert(verifications).values({
          identifier: phoneNumber,
          value: code,
          expiresAt,
          metadata: {
            name,
            zipCode,
            deviceBrand,
            warrantyStatus,
            serviceType,
            issueCategory,
            urgencyLevel,
            additionalInfo,
          },
        })

        console.log(`OTP for WhatsApp ${phoneNumber}: ${code}`)

        return reply.status(204).send()
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
