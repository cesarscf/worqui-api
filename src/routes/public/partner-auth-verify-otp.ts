import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { partners, verifications } from "@/db/schema"
import { errorSchemas } from "@/utils/error-schemas"

export async function partnerAuthVerifyOtp(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/partner-auth/verify-otp",
    {
      schema: {
        tags: ["Partner Auth"],
        summary: "Verify OTP code and authenticate partner",
        body: z.object({
          phoneNumber: z.string().min(8).max(20),
          code: z.string().length(6),
          name: z.string().optional(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          400: errorSchemas.validationError,
          401: errorSchemas.unauthorized,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      try {
        const { phoneNumber, code, name } = request.body

        const verification = await db.query.verifications.findFirst({
          where: and(
            eq(verifications.identifier, phoneNumber),
            eq(verifications.value, code),
          ),
        })

        if (!verification) {
          return reply
            .status(401)
            .send({ message: "Invalid verification code" })
        }

        if (verification.expiresAt < new Date()) {
          await db
            .delete(verifications)
            .where(eq(verifications.id, verification.id))

          return reply
            .status(401)
            .send({ message: "Verification code has expired" })
        }

        let partner = await db.query.partners.findFirst({
          where: eq(partners.phone, phoneNumber),
        })

        if (!partner) {
          const [newPartner] = await db
            .insert(partners)
            .values({
              name: name ?? phoneNumber,
              email: `${phoneNumber}@temp.worqui.com`,
              phone: phoneNumber,
              phoneVerifiedAt: new Date(),
            })
            .returning()

          partner = newPartner
        } else {
          const [updatedPartner] = await db
            .update(partners)
            .set({ phoneVerifiedAt: new Date() })
            .where(eq(partners.id, partner.id))
            .returning()

          partner = updatedPartner
        }

        await db
          .delete(verifications)
          .where(eq(verifications.id, verification.id))

        const token = await reply.jwtSign(
          { sub: partner.id, type: "partner" },
          {
            sign: { expiresIn: "7d" },
          },
        )

        return reply.status(200).send({ token })
      } catch {
        return reply.status(500).send({ message: "Internal server error" })
      }
    },
  )
}
