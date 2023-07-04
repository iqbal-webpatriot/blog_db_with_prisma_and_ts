
// creating server with express in ts 
import express from 'express';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dontenv from 'dotenv';
dontenv.config();//Loading environment variables from .env file
const prisma= new PrismaClient();//initializing prisma client
//!initializing express app 
const app = express();
const PORT= process.env.PORT || 5000;
//!global middleware 
app.use(cors());
app.use(express.json());


app.listen(PORT,async()=>{
    try {
       const connect=  await prisma.$connect()
        console.log(`Server is running on port ${PORT}`)
    } catch (error) {
        console.log('error while connecting to database',error)
    }
})