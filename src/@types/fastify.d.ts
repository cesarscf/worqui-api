import "fastify"

declare module "fastify" {
  export interface FastifyRequest {
    getCurrentPartnerId(): Promise<string>
  }
}
