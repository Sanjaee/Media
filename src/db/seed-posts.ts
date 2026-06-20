import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './index';
import { users, posts, media } from './schema/index';

async function seed() {
  console.log('Seeding posts with media...');
  
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
  const mediaData = [];

  for (let i = 0; i < 1000; i++) {
    const postId = crypto.randomUUID();
    postsData.push({
      id: postId,
      authorId: userId,
      content: `This is seed post number ${i + 1} with image! Hello world!`,
      visibility: 'public',
    });

    // Add media to ~30% of posts
    if (Math.random() < 0.3) {
      const numImages = Math.floor(Math.random() * 4) + 1; // 1 to 4 images
      for (let j = 0; j < numImages; j++) {
        mediaData.push({
          id: crypto.randomUUID(),
          postId: postId,
          type: 'image',
          url: `https://res.cloudinary.com/dgnpa43as/image/upload/v1756577738/lostmedia/bcngdyfivk2zcsottqti.png`,
          width: 800,
          height: 600,
          sortOrder: j,
        });
      }
    }
  }

  // Insert in batches of 100 to avoid limits
  for (let i = 0; i < postsData.length; i += 100) {
    const postBatch = postsData.slice(i, i + 100);
    await db.insert(posts).values(postBatch);
    console.log(`Inserted post batch ${i / 100 + 1}`);
  }

  // Insert media in batches of 100
  for (let i = 0; i < mediaData.length; i += 100) {
    const mediaBatch = mediaData.slice(i, i + 100);
    await db.insert(media).values(mediaBatch);
    console.log(`Inserted media batch ${Math.floor(i / 100) + 1}`);
  }

  console.log(`Seeding complete! 1000 posts and ${mediaData.length} media items created.`);
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
