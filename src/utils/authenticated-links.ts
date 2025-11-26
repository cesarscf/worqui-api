import type { FastifyReply } from "fastify"
import { env } from "@/env"

interface GenerateAuthenticatedLinkOptions {
  reply: FastifyReply
  userId: string
  userType: "customer" | "partner"
  path: string
  expiresInHours?: number
}

interface AuthenticatedLinkPayload {
  sub: string
  type: "customer" | "partner"
  path: string
}

export async function generateAuthenticatedLink({
  reply,
  userId,
  userType,
  path,
  expiresInHours = 24,
}: GenerateAuthenticatedLinkOptions) {
  const payload: AuthenticatedLinkPayload = {
    sub: userId,
    type: userType,
    path,
  }

  const token = await reply.jwtSign(payload, {
    expiresIn: `${expiresInHours}h`,
  })

  return `${env.APP_URL}${path}?token=${token}`
}
