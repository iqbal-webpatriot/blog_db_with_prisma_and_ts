
import { redisClient } from "..";

// Delete all keys matching a specific pattern
export const deleteKeysByPattern = async (pattern: string) => {
    try {
        const keys = await redisClient.keys(pattern);
    console.log('keys to be deleted', keys);
    if (keys.length > 0) {
     const result=  await redisClient.del(keys);
     console.log('deleted kyes result', result);
    }
    } catch (error) {
        console.log('Something went wrong',error)
    }
  
}
  