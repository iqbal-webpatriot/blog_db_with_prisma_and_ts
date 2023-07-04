import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Create and insert users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      name: 'User 1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      name: 'User 2',
    },
  });

  // Create and insert posts
  const post1 = await prisma.post.create({
    data: {
      slug: 'post-1',
      title: 'Post 1',
      body: 'This is the body of Post 1',
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      slug: 'post-2',
      title: 'Post 2',
      body: 'This is the body of Post 2',
      authorId: user2.id,
    },
  });

  console.log('Database seeded successfully');
}

seed()
  .catch((error) => {
    console.error('Error while seeding the database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
