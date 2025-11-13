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
import { acceptQuotation } from "./routes/customer/accept-quotation"
import { createServiceOrder } from "./routes/customer/create-service-order"
import { getServiceOrderQuotations } from "./routes/customer/get-service-order-quotations"
import { addPartnerServiceCategory } from "./routes/partner/add-partner-service-category"
import { createQuotation } from "./routes/partner/create-quotation"
import { getPartner } from "./routes/partner/get-partner"
import { getPartnerServiceOrders } from "./routes/partner/get-partner-service-orders"
import { customerAuthSendOtp } from "./routes/public/customer-auth-send-otp"
import { customerAuthVerify } from "./routes/public/customer-auth-verify"
import { getServiceCategories } from "./routes/public/get-service-categories"
import { getServiceCategory } from "./routes/public/get-service-category"
import { partnerAuthSendOtp } from "./routes/public/partner-auth-send-otp"
import { partnerAuthVerify } from "./routes/public/partner-auth-verify"

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

// Public routes
app.register(customerAuthSendOtp)
app.register(customerAuthVerify)
app.register(partnerAuthSendOtp)
app.register(partnerAuthVerify)
app.register(getServiceCategories)
app.register(getServiceCategory)

// Customer routes
app.register(createServiceOrder)
app.register(getServiceOrderQuotations)
app.register(acceptQuotation)

// Partner routes
app.register(getPartner)
app.register(addPartnerServiceCategory)
app.register(getPartnerServiceOrders)
app.register(createQuotation)

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("🔥 HTTP server running on http://localhost:3333")
    console.log("📚 Docs available at http://localhost:3333/docs")
  })
