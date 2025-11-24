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
import { acceptProposal } from "./routes/customer/accept-proposal"
import { createServiceOrder } from "./routes/customer/create-service-order"
import { getServiceOrderProposals } from "./routes/customer/get-service-order-proposals"
import { addPartnerServiceCategory } from "./routes/partner/add-partner-service-category"
import { createProposal } from "./routes/partner/create-proposal"
import { getPartner } from "./routes/partner/get-partner"
import { getPartnerServiceOrders } from "./routes/partner/get-partner-service-orders"
import { customerAuthSendOtp } from "./routes/public/customer-auth-send-otp"
import { customerAuthVerify } from "./routes/public/customer-auth-verify"
import { getServiceCategories } from "./routes/public/get-service-categories"
import { getServiceCategory } from "./routes/public/get-service-category"
import { partnerAuthLogin } from "./routes/public/partner-auth-login"
import { partnerAuthLoginVerify } from "./routes/public/partner-auth-login-verify"
import { partnerAuthRegister } from "./routes/public/partner-auth-register"
import { partnerAuthRegisterVerify } from "./routes/public/partner-auth-register-verify"

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

app.register(customerAuthSendOtp)
app.register(customerAuthVerify)
app.register(partnerAuthLogin)
app.register(partnerAuthLoginVerify)
app.register(partnerAuthRegister)
app.register(partnerAuthRegisterVerify)
app.register(getServiceCategories)
app.register(getServiceCategory)

app.register(createServiceOrder)
app.register(getServiceOrderProposals)
app.register(acceptProposal)

app.register(getPartner)
app.register(addPartnerServiceCategory)
app.register(getPartnerServiceOrders)
app.register(createProposal)

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log("🔥 HTTP server running on http://localhost:3333")
    console.log("📚 Docs available at http://localhost:3333/docs")
  })

//  [
//     "Brastemp",
//     "Consul",
//     "Electrolux",
//     "Elgin",
//     "Fujitsu",
//     "Gree",
//     "Komeco",
//     "LG",
//     "Midea",
//     "Philco",
//     "Samsung",
//     "Spinger Carrier",
//     "York",
//     "Outras"
//   ]

// ["Dentro da garantia", "Fora da garantia?"]

// ["Manutenção", "Instalação"]

// [ "Não, apenas instalação do ar condicionado","Barulho excessivo", "Controle com problema", "Desliga sozinho", "Não liga", "Higienização", "Troca de filtro", "Vazamento", "Outro"]

// ["Não tenho data definida", "Urgente", "Nos próximos 7 dias", "Nos próximos 15 dias", "Nos próximos 30 dias"]

// ["Informações adicionais"]

// ["CEP"]
