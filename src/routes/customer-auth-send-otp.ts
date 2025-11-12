import { eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { verifications } from "@/db/schema"
import { errorSchemas } from "@/utils/error-handler"

export async function customerAuthSendOtp(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/customer-auth/send-otp",
    {
      schema: {
        tags: ["Customer Auth"],
        summary: "Send OTP code to customer phone",
        body: z.object({
          phoneNumber: z.string().min(8).max(20),
        }),
        response: {
          204: z.void(),
          400: errorSchemas.validationError,
          500: errorSchemas.internalServerError,
        },
      },
    },
    async (request, reply) => {
      const { phoneNumber } = request.body

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
    },
  )
}
