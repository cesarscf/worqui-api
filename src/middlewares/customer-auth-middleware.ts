import type { FastifyRequest } from "fastify"

export async function customerAuthMiddleware(request: FastifyRequest) {
  request.getCurrentCustomerId = async () => {
    try {
      const { sub, type } = await request.jwtVerify<{
        sub: string
        type: string
      }>()

      if (type !== "customer") {
        throw { statusCode: 401, message: "Invalid token" }
      }

      return sub
    } catch {
      throw { statusCode: 401, message: "Invalid token" }
    }
  }
}
