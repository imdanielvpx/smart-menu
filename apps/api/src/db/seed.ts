import { db } from './index.js';
import { restaurants, categories, plates, ratings, adminUsers } from './schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
  const [restaurant] = await db.insert(restaurants).values({
    name: 'El Sabor',
    slug: 'el-sabor',
    logoUrl: 'https://source.unsplash.com/random/100x100?restaurant'
  }).onConflictDoNothing().returning();

  const restId = restaurant?.id || (await db.select().from(restaurants).where(eq(restaurants.slug, 'el-sabor')))[0].id;

  const cats = await db.insert(categories).values([
    { restaurantId: restId, name: 'Entradas', position: 1 },
    { restaurantId: restId, name: 'Fuertes', position: 2 },
    { restaurantId: restId, name: 'Postres', position: 3 },
  ]).returning();

  const platesData = [
    { name: 'Bruschetta', category: cats[0] },
    { name: 'Ceviche', category: cats[0] },
    { name: 'Pasta Alfredo', category: cats[1] },
    { name: 'Tacos', category: cats[1] },
    { name: 'Lasaña', category: cats[1] },
    { name: 'Cheesecake', category: cats[2] },
    { name: 'Helado', category: cats[2] },
    { name: 'Brownie', category: cats[2] },
  ];

  const plateValues = platesData.map((p, idx) => ({
    restaurantId: restId,
    categoryId: p.category.id,
    name: p.name,
    description: p.name,
    priceCents: 1000 + idx * 100,
    photoUrl: `https://source.unsplash.com/random/400x300?food-${idx}`,
    isActive: true,
  }));

  const insertedPlates = await db.insert(plates).values(plateValues).returning();

  // 50 random ratings
  const now = Date.now();
  const ratingsValues = Array.from({ length: 50 }).map(() => {
    const plate = insertedPlates[Math.floor(Math.random() * insertedPlates.length)];
    const stars = Math.floor(Math.random() * 5) + 1;
    const daysAgo = Math.floor(Math.random() * 30);
    return {
      restaurantId: restId,
      plateId: plate.id,
      stars,
      comment: stars < 3 ? 'No me gustó' : 'Muy rico',
      createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000)
    };
  });

  await db.insert(ratings).values(ratingsValues);

  await db.insert(adminUsers).values({ restaurantId: restId, email: 'admin@elsabor.com' }).onConflictDoNothing();

  console.log('Seed completed');
}

seed().then(() => process.exit(0));
