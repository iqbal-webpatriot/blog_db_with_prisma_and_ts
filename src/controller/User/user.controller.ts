import { Router } from "express";
import { prisma } from "../..";
const router = Router();

router.get('/users',async(req,res)=>{
    try {
        const allusers= await prisma.user.findMany();
        return res.status(200).send(allusers)
    } catch (error) {
        return res.status(404).send(error)
    }
})
//route to create new entry in user model 
router.post('/user',async(req,res)=>{
    try {
        const newUser= await prisma.user.create({
        data:{
         email:"test@example.com",
            name:"test",

        } 
        })
        return res.status(201).send(newUser)
    } catch (error) {
        
        return res.status(500).send(error)
    }
})




export default router;