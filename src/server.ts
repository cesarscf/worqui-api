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
import { createProposal } from "./routes/create-proposal"
import { createServiceOrder } from "./routes/create-service-order"
import { getProposal } from "./routes/get-proposal"
import { getServiceOrders } from "./routes/get-service-orders"
import { partnerAuthLoginSendOtp } from "./routes/partner-auth-login-send-otp"
import { partnerAuthLoginVerify } from "./routes/partner-auth-login-verify"
import { partnerAuthRegisterSendOtp } from "./routes/partner-auth-register-send-otp"
import { partnerAuthRegisterVerify } from "./routes/partner-auth-register-verify"
import { sendServiceOrderOtp } from "./routes/send-service-order-otp"
import { updateProposalStatus } from "./routes/update-proposal-status"

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

app.register(partnerAuthLoginSendOtp)
app.register(partnerAuthLoginVerify)
app.register(partnerAuthRegisterSendOtp)
app.register(partnerAuthRegisterVerify)
app.register(sendServiceOrderOtp)
app.register(createServiceOrder)
app.register(getServiceOrders)
app.register(createProposal)
app.register(getProposal)
app.register(updateProposalStatus)

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("🔥 HTTP server running on http://localhost:3333")
    console.log("📚 Docs available at http://localhost:3333/docs")
  })
