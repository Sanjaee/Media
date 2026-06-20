import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './index';
import { users, posts } from './schema/index';

async function seed() {
  console.log('Seeding posts...');
  
  // Get at least one user
  let userList = await db.select().from(users).limit(1);
  let userId = userList[0]?.id;

  if (!userId) {
    console.log('No users found. Creating a dummy user...');
    const newUser = await db.insert(users).values({
      id: crypto.randomUUID(),
      username: 'seed_user',
      name: 'Seed User',
      email: `seed_${Date.now()}@example.com`,
    }).returning();
    userId = newUser[0].id;
  }

  const postsData = [];
  for (let i = 0; i < 1000; i++) {
    postsData.push({
      id: crypto.randomUUID(),
      authorId: userId,
      content: `This is seed post number ${i + 1}. Hello world!`,
      visibility: 'public',
    });
  }

  // Insert in batches of 100 to avoid limits
  for (let i = 0; i < postsData.length; i += 100) {
    const batch = postsData.slice(i, i + 100);
    await db.insert(posts).values(batch);
    console.log(`Inserted batch ${i / 100 + 1}`);
  }

  console.log('Seeding complete! 1000 posts created.');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
