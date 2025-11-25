import { eq, or } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partners, verifications } from "@/db/schema"
import { errorSchemas } from "@/utils/error-schemas"

export async function partnerAuthRegister(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/partner-auth/register",
    {
      schema: {
        tags: ["Partner Auth"],
        summary: "Register a new partner and send OTP code",
        body: z.object({
          name: z.string().min(3).max(255),
          email: z.email(),
          phoneNumber: z.string().min(8).max(20),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          409: errorSchemas.conflict,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const { phoneNumber, name, email } = request.body

        const existingPartner = await db.query.partners.findFirst({
          where: or(eq(partners.phone, phoneNumber), eq(partners.email, email)),
        })

        if (existingPartner) {
          return reply.status(409).send({
            message: "Já existe um usuário com este telefone ou email",
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
          metadata: { name, email },
        })

        console.log(`OTP for ${phoneNumber} (${name} - ${email}): ${code}`)

        return reply.status(204).send()
      } catch {
        return reply.status(500).send({ message: "Erro interno do servidor" })
      }
    },
  )
}
