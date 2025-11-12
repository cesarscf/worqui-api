import "fastify"

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentCustomerId(): Promise<string>
  }
}
