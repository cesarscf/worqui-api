import { and, eq } from "drizzle-orm"
import type { FastifyInstance } from "fastify"
import type { ZodTypeProvider } from "fastify-type-provider-zod"
import z from "zod"
import { db } from "@/db"
import { customers, verifications } from "@/db/schema"
import { errorSchemas, UnauthorizedError } from "@/utils/error-handler"

export async function customerAuthVerify(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/customer-auth/verify",
    {
      schema: {
        tags: ["Customer Auth"],
        summary: "Verify OTP code and authenticate customer",
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
      const { phoneNumber, code, name } = request.body

      const verification = await db.query.verifications.findFirst({
        where: and(
          eq(verifications.identifier, phoneNumber),
          eq(verifications.value, code)
        ),
      })

      if (!verification) {
        throw new UnauthorizedError("Invalid verification code")
      }

      if (verification.expiresAt < new Date()) {
        await db
          .delete(verifications)
          .where(eq(verifications.id, verification.id))

        throw new UnauthorizedError("Verification code has expired")
      }

      let customer = await db.query.customers.findFirst({
        where: eq(customers.phone, phoneNumber),
      })

      if (!customer) {
        const [newCustomer] = await db
          .insert(customers)
          .values({
            name: name ?? phoneNumber,
            email: `${phoneNumber}@temp.worqui.com`,
            phone: phoneNumber,
            phoneVerifiedAt: new Date(),
          })
          .returning()
        customer = newCustomer
      } else {
        const [updatedCustomer] = await db
          .update(customers)
          .set({ phoneVerifiedAt: new Date() })
          .where(eq(customers.id, customer.id))
          .returning()
        customer = updatedCustomer
      }

      await db
        .delete(verifications)
        .where(eq(verifications.id, verification.id))

      const token = await reply.jwtSign(
        { sub: customer.id },
        {
          sign: { expiresIn: "7d" },
        }
      )

      return reply.status(200).send({ token })
    },
  )
}
