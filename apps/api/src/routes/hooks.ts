import { FastifyInstance } from 'fastify';

export async function hooksRoutes(app: FastifyInstance) {
  app.post('/coupon', async (req) => {
    console.log('[COUPON]', req.body);
    return { ok: true };
  });
}
