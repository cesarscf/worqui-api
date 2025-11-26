import { fastifyCors } from "@fastify/cors"
import { fastifyJwt } from "@fastify/jwt"
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
import { getServiceOrders } from "./routes/get-service-orders"
import { partnerAuthLogin } from "./routes/partner-auth-login"
import { partnerAuthLoginVerify } from "./routes/partner-auth-login-verify"
import { partnerAuthRegister } from "./routes/partner-auth-register"
import { partnerAuthRegisterVerify } from "./routes/partner-auth-register-verify"
import { proposalCreate } from "./routes/proposal-create"
import { proposalGet } from "./routes/proposal-get"
import { proposalUpdateStatus } from "./routes/proposal-update-status"
import { serviceOrderCreate } from "./routes/service-order-create"
import { serviceOrderSendOtp } from "./routes/service-order-send-otp"

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
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})

app.register(ScalarApiReference, {
  routePrefix: "/docs",
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(partnerAuthLogin)
app.register(partnerAuthLoginVerify)
app.register(partnerAuthRegister)
app.register(partnerAuthRegisterVerify)
app.register(serviceOrderSendOtp)
app.register(serviceOrderCreate)
app.register(getServiceOrders)
app.register(proposalCreate)
app.register(proposalGet)
app.register(proposalUpdateStatus)

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("🔥 HTTP server running on http://localhost:3333")
    console.log("📚 Docs available at http://localhost:3333/docs")
  })
