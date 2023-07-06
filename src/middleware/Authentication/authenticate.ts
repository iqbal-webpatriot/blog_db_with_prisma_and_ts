import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const verifyToken = (token:string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, `${process.env.JWT_SECRET_KEY}`, (err, user) => {
      if (err) return reject(err);

      resolve(user);
    });
  });
};
//!defining type for authenitcate function
export interface AuthenticatedRequest extends Request {
    user: any; // Define the type of the 'user' property here
  }
 const authenticate = ()=>{
  return async (req:AuthenticatedRequest, res:Response, next:NextFunction) => {
    // check if authorization header has been set
    // if not throw an errors
    
    if (!req.headers.authorization)
      return res.status(400).send({
        message: "authorization token was not provided or was not valid",
      });
  
    // if bearer token is in authorization header
    // if not throw an error
    if (!req.headers.authorization.startsWith("Bearer "))
      return res?.status(400).send({
        message: "authorization token was not provided or was not valid",
      });
  
    // split the bearer token and get the [1] which is the token
    const token = req.headers.authorization.split(" ")[1];
  
    // then we will call jwt to verify the token
    let user:any;
    // if token is invalid then we will throw an error
    try {
      user = await verifyToken(token);
    } catch (err) {
      return res.status(400).send({
        message: "authorization token was not provided or was not valid",
      });
    }
  
    // if token is valid then we will put the user retrieved from the token in the req object
    req.user = user.user;
  
    // return next()
    return next();
  };
}
export  default authenticate;