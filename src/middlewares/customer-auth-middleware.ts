import type { FastifyRequest } from "fastify"
import { UnauthorizedError } from "@/utils/error-handler"

export async function customerAuthMiddleware(request: FastifyRequest) {
  request.getCurrentCustomerId = async () => {
    try {
      const { sub } = await request.jwtVerify<{ sub: string }>()

      return sub
    } catch {
      throw new UnauthorizedError("Invalid token")
    }
  }
}
