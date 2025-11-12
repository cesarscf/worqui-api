import type { FastifyInstance } from "fastify"
import { ZodError, z } from "zod"

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorSchemas = {
  badRequest: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  validationError: z.object({
    message: z.string(),
    errors: z.record(z.string(), z.array(z.string())),
  }),
  internalServerError: z.object({
    message: z.string(),
  }),
}

export class UnauthorizedError extends Error {
  constructor(message?: string) {
    super(message ?? "Unauthorized.")
  }
}

export class ForbiddenError extends Error {}

export class BadRequestError extends Error {}

export class NotFoundError extends Error {}

export const errorHandler: FastifyErrorHandler = (error, _, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Validation error",
      errors: error.flatten().fieldErrors,
    })
  }

  if (error instanceof BadRequestError) {
    reply.status(400).send({
      message: error.message,
    })
  }

  if (error instanceof ForbiddenError) {
    reply.status(403).send({
      message: error.message,
    })
  }

  if (error instanceof UnauthorizedError) {
    reply.status(401).send({
      message: error.message,
    })
  }

  if (error instanceof NotFoundError) {
    reply.status(404).send({
      message: error.message,
    })
  }

  reply.status(500).send({ message: "Internal server error" })
}
