import dotenv from 'dotenv'
dotenv.config();
import jwt from 'jsonwebtoken';
import { Response,Request } from 'express';
import { prisma } from '../..';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { body } from 'express-validator';
// function to create new token for the new user
const newToken=(user:any,expireTime:string)=>{
    return jwt.sign({user},`${process.env.JWT_SECRET_KEY}`,{expiresIn:expireTime})
}
//!register validation 
 export const registerValidation=[
    body('email').exists().withMessage('Email field  is required').bail().notEmpty().withMessage("Email can not be empty string").bail().isEmail().withMessage("Invalid email address"),
    body('password').exists().withMessage('Password field is required').bail(). isString().withMessage('Password must be a string').bail().isLength({min:6}).withMessage('Password must be at least 6 characters'),
    body('name').exists().withMessage('Name is required').bail().isString().withMessage('Name must be a string'),
]
//!login validation 
export const loginValidation=[
    body('email').exists().withMessage('Email field  is required').bail().notEmpty().withMessage("Email can not be empty string").bail().isEmail().withMessage("Invalid email address"),
    body('password').exists().withMessage('Password field is required').bail().
    isString().withMessage('Password must be a string').bail()
    .isLength({min:6}).withMessage('Password must be at least 6 characters'),
  
]
// register method 
const register= async (req:Request,res:Response)=>{
 try {
     //check if user is has already registered 
        const user= await prisma.user.findUnique({
            where:{
                email:req.body.email
            }
        });
        //if user is already registered return error
        if (user) return res.status(400).send({message:"Email already exists"});
        //if user is not registered create new user
        const newUser= await prisma.user.create({
            data:{
                email:req.body.email,
                name:req.body.name,
                password:hashPassword(req.body.password),
            }
        });
     return res.status(201).send({message:'Account created successfully'})
 } catch (error) {
    return res.status(500).send(error);
 }
}

const login= async (req:Request, res:Response) => {
 try {
    //check if user is already registered
    const user = await prisma.user.findUnique({
        where:{email:req.body.email}
    });
    //if user is not registered return error
    if (!user) return res.status(400).send({message:"Please check your email or password "});
    //check if password is correct
    if(!comparePassword(req.body.password,user.password)){
        return res.status(400).send({message:"Please check your email or password "});
    }
    // create a token and return user data 
    const token = newToken(user,'1d');
    const {id,email,address,avatar,createdAt,updatedAt,name}=user
    return res.status(200).send({user:{
        id,email,address,avatar,createdAt,updatedAt,name
    },token});
    
 } catch (error) {
    return res.status(500).send(error);
 }
}
export {login,register}