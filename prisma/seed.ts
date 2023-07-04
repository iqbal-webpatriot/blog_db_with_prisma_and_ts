import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.util';

const prisma = new PrismaClient();

async function seed() {
  // Create and insert users
  const user1 = await prisma.user.create({
    data: {
      email: 'testuser@gmail.com',
      name: 'test user one',
      password: hashPassword('Test@123')
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

  console.log('Database seeded successfully');
}

seed()
  .catch((error) => {
    console.error('Error while seeding the database:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
