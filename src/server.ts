import { fastifyCors } from "@fastify/cors"
import { fastifySwagger } from "@fastify/swagger"
import ScalarApiReference from "@scalar/fastify-api-reference"
import { fastify } from "fastify"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"
import { env } from "./env"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Worqui API",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: "/docs",
})

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("🔥 HTTP server running on http://localhost:3333")
    console.log("📚 Docs available at http://localhost:3333/docs")
  })
