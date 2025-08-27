import { FastifyInstance, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { restaurants, categories, plates, ratings, adminUsers, magicTokens } from '../db/schema.js';
import { eq, desc, sql, and, gt, lte, count, avg, countDistinct } from 'drizzle-orm';
import { requireAuth } from '../utils/auth.js';
import crypto from 'crypto';

export async function adminRoutes(app: FastifyInstance) {
  // Auth
  app.post('/auth/magic-link', async (req) => {
    const body = z.object({ email: z.string().email() }).parse(req.body);
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, body.email));
    if (!user) return { ok: true }; // pretend
    const token = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await db.insert(magicTokens).values({ adminUserId: user.id, token, expiresAt: expires });
    const url = `${process.env.APP_URL}/api/admin/auth/verify?token=${token}`;
    console.log('[MAGIC LINK]', url);
    return { ok: true };
  });

  app.get('/auth/verify', async (req: any, reply: FastifyReply) => {
    const tokenStr = req.query.token as string;
    const [token] = await db.select().from(magicTokens).where(eq(magicTokens.token, tokenStr));
    if (!token || token.used) return reply.code(400).send({ error: 'invalid' });
    await db.update(magicTokens).set({ used: true }).where(eq(magicTokens.id, token.id));
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, token.adminUserId));
    const jwtToken = app.jwt.sign({ adminId: user.id, restaurantId: user.restaurantId });
    reply.setCookie('token', jwtToken, { path: '/', httpOnly: true });
    reply.redirect('/admin');
  });

  // Protect following routes
  app.addHook('preHandler', async (req, reply) => {
    if (req.routerPath && req.routerPath.startsWith('/auth')) return;
    await requireAuth(req);
  });

  app.get('/metrics/overview', async (req) => {
    const { restaurantId } = req.user as any;
    const topPlates = await db
      .select({ id: plates.id, name: plates.name, avg: avg(ratings.stars).as('avg') })
      .from(plates)
      .leftJoin(ratings, and(eq(ratings.plateId, plates.id), gt(ratings.createdAt, sql`now() - interval '14 days'`)))
      .where(eq(plates.restaurantId, restaurantId))
      .groupBy(plates.id)
      .orderBy(desc(sql`avg`))
      .limit(5);

    const badPlates = await db
      .select({ id: plates.id, name: plates.name, count: count(ratings.id).as('count') })
      .from(plates)
      .leftJoin(ratings, and(eq(ratings.plateId, plates.id), gt(ratings.createdAt, sql`now() - interval '7 days'`), lte(ratings.stars, 2)))
      .where(eq(plates.restaurantId, restaurantId))
      .groupBy(plates.id)
      .orderBy(desc(sql`count`))
      .limit(5);

    const today = await db
      .select({
        count: count(ratings.id).as('count'),
        avg: avg(ratings.stars).as('avg')
      })
      .from(ratings)
      .where(and(eq(ratings.restaurantId, restaurantId), gt(ratings.createdAt, sql`date_trunc('day', now())`)));
    const [{ count: totalPlates }] = await db.select({ count: count() }).from(plates).where(eq(plates.restaurantId, restaurantId));
    const [{ count: platesWith }] = await db
      .select({ count: countDistinct(ratings.plateId).as('count') })
      .from(ratings)
      .where(and(eq(ratings.restaurantId, restaurantId), gt(ratings.createdAt, sql`date_trunc('day', now())`)));
    const noFeedbackPct = totalPlates === 0 ? 0 : ((totalPlates - platesWith) / totalPlates) * 100;
    return { topPlates, badPlates, todayCounts: today[0].count, avgToday: today[0].avg, noFeedbackPct };
  });

  // Categories CRUD
  app.get('/categories', async (req) => {
    const { restaurantId } = req.user as any;
    return db.select().from(categories).where(eq(categories.restaurantId, restaurantId));
  });

  app.post('/categories', async (req) => {
    const { restaurantId } = req.user as any;
    const body = z.object({ name: z.string(), position: z.number().optional() }).parse(req.body);
    const [cat] = await db.insert(categories).values({ ...body, restaurantId }).returning();
    return cat;
  });

  app.patch('/categories/:id', async (req) => {
    const { restaurantId } = req.user as any;
    const id = Number((req.params as any).id);
    const body = z.object({ name: z.string().optional(), position: z.number().optional() }).parse(req.body);
    const [cat] = await db
      .update(categories)
      .set(body)
      .where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId)))
      .returning();
    return cat;
  });

  app.delete('/categories/:id', async (req) => {
    const { restaurantId } = req.user as any;
    const id = Number((req.params as any).id);
    await db.delete(categories).where(and(eq(categories.id, id), eq(categories.restaurantId, restaurantId)));
    return { ok: true };
  });

  // Plates CRUD
  app.get('/plates', async (req) => {
    const { restaurantId } = req.user as any;
    return db.select().from(plates).where(eq(plates.restaurantId, restaurantId));
  });

  app.post('/plates', async (req) => {
    const { restaurantId } = req.user as any;
    const body = z.object({
      categoryId: z.number(),
      name: z.string(),
      description: z.string().optional(),
      priceCents: z.number(),
      photoUrl: z.string().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);
    const [plate] = await db.insert(plates).values({ ...body, restaurantId }).returning();
    return plate;
  });

  app.patch('/plates/:id', async (req) => {
    const { restaurantId } = req.user as any;
    const id = Number((req.params as any).id);
    const body = z.object({
      categoryId: z.number().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      priceCents: z.number().optional(),
      photoUrl: z.string().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);
    const [plate] = await db
      .update(plates)
      .set(body)
      .where(and(eq(plates.id, id), eq(plates.restaurantId, restaurantId)))
      .returning();
    return plate;
  });

  app.delete('/plates/:id', async (req) => {
    const { restaurantId } = req.user as any;
    const id = Number((req.params as any).id);
    await db.delete(plates).where(and(eq(plates.id, id), eq(plates.restaurantId, restaurantId)));
    return { ok: true };
  });

  // Ratings list
  app.get('/ratings', async (req) => {
    const { restaurantId } = req.user as any;
    const q = z.object({ plateId: z.string().optional(), sentiment: z.string().optional() }).parse(req.query);
    let where = eq(ratings.restaurantId, restaurantId);
    if (q.plateId) where = and(where, eq(ratings.plateId, Number(q.plateId)));
    if (q.sentiment === 'neg') where = and(where, lte(ratings.stars, 2));
    if (q.sentiment === 'pos') where = and(where, gt(ratings.stars, 3));
    return db.select().from(ratings).where(where).orderBy(desc(ratings.createdAt));
  });

  // Settings
  app.get('/settings', async (req) => {
    const { restaurantId } = req.user as any;
    const [rest] = await db.select().from(restaurants).where(eq(restaurants.id, restaurantId));
    return rest;
  });

  app.patch('/settings', async (req) => {
    const { restaurantId } = req.user as any;
    const body = z.object({ name: z.string().optional(), slug: z.string().optional(), logoUrl: z.string().optional() }).parse(req.body);
    const [rest] = await db.update(restaurants).set(body).where(eq(restaurants.id, restaurantId)).returning();
    return rest;
  });
}
