import { Router } from "express";
import { prisma } from "../..";
const router = Router();

router.get('/users',async(req,res)=>{
    try {
        const allusers= await prisma.user.findMany({
            include:{
                posts:true,
            }
        });
        return res.status(200).send(allusers)
    } catch (error) {
        return res.status(404).send(error)
    }
})





export default router;