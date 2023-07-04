import { Router } from "express";
import { prisma } from "../..";
const router = Router();

router.get('/posts',async(req,res)=>{
    try {
        const allPosts= await prisma.post.findMany({
            include:{
                author:{
                    select:{
                        id: true,
                        email:true,
                        name:true,
                    }
                },
                comments:true,
            }
        });
        return res.status(200).send(allPosts)
    } catch (error) {
        return res.status(404).send(error)
    }
})
//route to create new entry in user model 
router.post('/post',async(req,res)=>{
    // try {
    //     const newUser= await prisma.post.create({
    //     data:{
    //      email:"test@example.com",
    //         name:"test",

    //     } 
    //     })
    //     return res.status(201).send(newUser)
    // } catch (error) {
        
    //     return res.status(500).send(error)
    // }
})




export default router;