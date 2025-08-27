import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../db/index.js';
import { restaurants, categories, plates, ratings } from '../db/schema.js';
import { eq, avg, and, count } from 'drizzle-orm';

export async function publicRoutes(app: FastifyInstance) {
  app.get('/restaurants/:slug', async (req) => {
    const slug = (req.params as any).slug as string;
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
    if (!restaurant) return { error: 'not found' };
    const cats = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(eq(categories.restaurantId, restaurant.id));
    const [{ count: platesCount }] = await db
      .select({ count: count() })
      .from(plates)
      .where(and(eq(plates.restaurantId, restaurant.id), eq(plates.isActive, true)));
    return { restaurant, categories: cats, platesCount };
  });

  app.get('/restaurants/:slug/plates', async (req) => {
    const slug = (req.params as any).slug as string;
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.slug, slug));
    if (!restaurant) return [];
    const result = await db
      .select({
        id: plates.id,
        name: plates.name,
        description: plates.description,
        priceCents: plates.priceCents,
        photoUrl: plates.photoUrl,
        avg: avg(ratings.stars).as('avg'),
        count: count(ratings.id).as('count'),
      })
      .from(plates)
      .leftJoin(ratings, eq(ratings.plateId, plates.id))
      .where(and(eq(plates.restaurantId, restaurant.id), eq(plates.isActive, true)))
      .groupBy(plates.id);
    return result;
  });

  app.get('/plates/:id', async (req) => {
    const id = Number((req.params as any).id);
    const [plate] = await db.select().from(plates).where(eq(plates.id, id));
    if (!plate) return { error: 'not found' };
    const [{ avg: avgRating, count: total }] = await db
      .select({ avg: avg(ratings.stars), count: count(ratings.id) })
      .from(ratings)
      .where(eq(ratings.plateId, id));
    return { plate, avgRating, total };
  });

  app.post('/ratings', async (req) => {
    const bodySchema = z.object({
      plateId: z.number(),
      stars: z.number().min(1).max(5),
      comment: z.string().max(240).optional(),
    });
    const body = bodySchema.parse(req.body);
    const [plate] = await db.select().from(plates).where(eq(plates.id, body.plateId));
    if (!plate) return { error: 'invalid plate' };
    await db.insert(ratings).values({
      restaurantId: plate.restaurantId,
      plateId: body.plateId,
      stars: body.stars,
      comment: body.comment,
    });
    console.log('[COUPON]', { couponCode: process.env.COUPON_CODE || 'POSTRE10', source: 'rating' });
    return { coupon: process.env.COUPON_CODE || 'POSTRE10' };
  });
}
