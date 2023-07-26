import Bull from 'bull';
import { publishPost } from './postPublish.job';
import getActiveJobs from './activeJobs';
//!initilize queues
const Queue = Bull;
const blogQueue: Bull.Queue = new Queue('blog publishing', 'redis://127.0.0.1:6379');
// console.log('******Blog queru',blogQueue)
// ioredis client
const client = blogQueue.client;

client.on('connect', () => {
  console.log('Bull Successfully connected to Redis server');
});

client.on('error', (error) => {
  console.log(`Cannot connect to Redis server: ${error.message}`);
});
// Process blog posts
blogQueue.process(async (job) => {
  console.log(`Publishing blog post ${job.data.blogPostId}`);
  // Call a function from your service to publish the post
   await publishPost(job.data.blogPostId);
});

export default blogQueue;
