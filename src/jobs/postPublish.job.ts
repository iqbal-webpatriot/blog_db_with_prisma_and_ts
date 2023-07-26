import { prisma } from "..";
import blogQueue from "./queue";

export async function fetchAndSchedulePosts() {
    const posts = await prisma.post.findMany({
      where: { status: 'Scheduled' },
    });
    console.log('pending posts', posts);
  
    // Use map instead of forEach to return an array of promises
    const jobs = posts.map((post) => {
      if (post.scheduledAt) {
        const delay = post.scheduledAt.getTime() - new Date().getTime();
        console.log('delay ', delay);
        
        // Return the promise from blogQueue.add
        return blogQueue.add({ blogPostId: post.id }, { delay: delay, attempts: 3 });
      }
    });
  
    // Wait for all promises to be resolved
    await Promise.all(jobs);
  }
  
  
  export async function publishPost(postId: string) {
    // Update the post status to "Published" in the database
    return prisma.post.update({
      where: { id: postId },
      data: { status: 'Published' },
    });
  }