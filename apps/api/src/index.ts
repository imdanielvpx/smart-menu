import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { publicRoutes } from './routes/public.js';
import { adminRoutes } from './routes/admin.js';
import { hooksRoutes } from './routes/hooks.js';

const app = Fastify();
app.register(cors, { origin: process.env.FRONT_URL || true, credentials: true });
app.register(cookie);
app.register(jwt, { secret: process.env.JWT_SECRET || 'secret', cookie: { cookieName: 'token', signed: false } });

app.register(publicRoutes, { prefix: '/api/public' });
app.register(adminRoutes, { prefix: '/api/admin' });
app.register(hooksRoutes, { prefix: '/api/hooks' });

const port = Number(process.env.PORT || 3000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log('API running on port', port);
});
