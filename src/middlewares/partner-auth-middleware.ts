import type { FastifyRequest } from "fastify"

export async function partnerAuthMiddleware(request: FastifyRequest) {
  request.getCurrentPartnerId = async () => {
    try {
      const { sub, type } = await request.jwtVerify<{
        sub: string
        type: string
      }>()

      if (type !== "partner") {
        throw { statusCode: 401, message: "Token inválido" }
      }

      return sub
    } catch {
      throw { statusCode: 401, message: "Token inválido" }
    }
  }
}
