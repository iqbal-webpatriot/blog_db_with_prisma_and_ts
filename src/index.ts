import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Loading environment variables from .env file

export const prisma = new PrismaClient(); // Initializing Prisma client

// Import controller
import userController from './controller/User/user.controller';
import postController from './controller/Post/post.controller'
import {login,loginValidation,register, registerValidation} from './controller/Auth/auth.controller'
import commentController from './controller/Comment/comment.controller'
import handleValidation from './middleware/Validation/validationHandler';
import likeController from './controller/Like/like.controller'
import viewCountController from './controller/ViewCount/viewCount.controller';
import categoryController from './controller/Category/category.controller';
import tagController from './controller/Tag/tag.controller';

// Initializing express app
const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
app.use(cors());
app.use(express.json());
//making uploads folder public 
app.use('/uploads',express.static('uploads'))
// Routes
app.use('/api', userController);
app.use('/api', postController);
app.post('/api/login',handleValidation(loginValidation),login);
app.post('/api/register',handleValidation(registerValidation),register);
app.use('/api', commentController);
app.use('/api',likeController)
app.use('/api',viewCountController)
app.use('/api',categoryController)
app.use('/api',tagController)

// Connect to the database and start the server
// prisma.$connect()
//   .then(() => {
   
//   })
//   .catch((error) => {
//     console.log('Error while connecting to the database', error);
//   });
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });