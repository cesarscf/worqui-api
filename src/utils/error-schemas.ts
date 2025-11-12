import z from "zod"

export const errorSchemas = {
  validationError: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internalServerError: z.object({
    message: z.string(),
  }),
}
