import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Loading environment variables from .env file

export const prisma = new PrismaClient(); // Initializing Prisma client

// Import controller
import userController from './controller/User/user.controller';
import postController from './controller/Post/post.controller'
import {login,register} from './controller/Auth/auth.controller'

// Initializing express app
const app = express();
const PORT = process.env.PORT || 5000;

// Global middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userController);
app.use('/api', postController);
app.post('/api/login',login);
app.post('/api/register',register);

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