import { Router } from "express";
import { prisma } from "../..";
const router = Router();

router.get('/users',async(req,res)=>{
    try {
        const allUsers = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              posts: {
                select: {
                  id: true,
                  title: true,
                  body: true,
                  authorId: true,
                },
              },
            },
          });
        return res.status(200).send(allUsers)
    } catch (error) {
        return res.status(404).send(error)
    }
})





export default router;