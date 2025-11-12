import type { FastifyRequest } from "fastify"

export async function customerAuthMiddleware(request: FastifyRequest) {
  request.getCurrentCustomerId = async () => {
    try {
      const { sub } = await request.jwtVerify<{ sub: string }>()

      return sub
    } catch {
      throw { statusCode: 401, message: "Invalid token" }
    }
  }
}
