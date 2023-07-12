

import { redisClient  } from "..";
import { Request,Response } from "express";
export const setOrGetCache = async (
    req: Request,
    res: Response,
    cacheKey: string,
    prismaQuery: Promise<any>,
  cacheTime = 3600 // Default cache time (in seconds)
) => {
   try {
     const catchExist= await redisClient.get(cacheKey);
        if(catchExist){
            return res.status(200).send(JSON.parse(catchExist));
        }
        const freshData= await prismaQuery;
        await redisClient.setEx(cacheKey,cacheTime,JSON.stringify(freshData));
        return res.status(200).send(freshData);
   } catch (error) {
     console.log('error while caching',error)
     return res.status(500).send(error)
   }
};
