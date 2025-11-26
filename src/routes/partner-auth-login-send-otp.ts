import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partners, verifications } from "@/db/schema"
import { errorSchemas } from "@/utils/error-schemas"

export async function partnerAuthLoginSendOtp(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/partner-auth/login",
    {
      schema: {
        tags: ["Partner Auth"],
        summary: "Send OTP code for partner login",
        body: z.object({
          phoneNumber: z.string().min(8).max(20),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          404: errorSchemas.notFound,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const { phoneNumber } = request.body

        const existingPartner = await db.query.partners.findFirst({
          where: eq(partners.phoneNumber, phoneNumber),
        })

        if (!existingPartner) {
          return reply.status(404).send({
            message: "Usuário não encontrado. Por favor, registre-se primeiro.",
          })
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString()

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await db
          .delete(verifications)
          .where(eq(verifications.identifier, phoneNumber))

        await db.insert(verifications).values({
          identifier: phoneNumber,
          value: code,
          expiresAt,
        })

        console.log(`OTP for ${phoneNumber}: ${code}`)

        return reply.status(204).send()
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
