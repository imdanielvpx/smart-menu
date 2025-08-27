import { FastifyRequest } from 'fastify';

export async function requireAuth(req: FastifyRequest) {
  await req.jwtVerify();
}
