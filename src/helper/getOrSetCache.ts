

import { redisClient  } from "..";
import { Request,Response } from "express";
export const setOrGetCache = async (
    req: Request,
    res: Response,
    cacheKey: string,
    prismaQuery: Promise<any>,
    totalPages?: number,// for pagination in some apis
  cacheTime = 3600 // Default cache time (in seconds)
   
) => {
   try {
     const catchExist= await redisClient.get(cacheKey);
        if(catchExist){
          console.log('###Hitting cache ....###')
            return res.status(200).send(JSON.parse(catchExist));
        }
        console.log('**Fetching fresh data ....**')
        const freshData= await prismaQuery;
        let modifiedResult:{[key:string]:any} ={
          data:freshData
        }
         if(totalPages){
          modifiedResult={
            ...modifiedResult,
            totalPages
          }
         }
        await redisClient.setEx(cacheKey,cacheTime,JSON.stringify(modifiedResult));
        return res.status(200).send(modifiedResult);
   } catch (error) {
     console.log('error while caching',error)
     return res.status(500).send(error)
   }
};
