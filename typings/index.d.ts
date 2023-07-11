// import { Express } from "express-serve-static-core";
export {}

interface TokenData {
  userId: string;
  iat: string;
}

declare global {
    namespace Express {
      interface Request {
        user?: TokenData; // Define the user property on Request
      }
    }
  }