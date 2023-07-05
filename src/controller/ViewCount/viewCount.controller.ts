import { Router } from "express";
import { prisma } from "../..";
import ip from 'ip';
import { body } from "express-validator";
import handleValidation from "../../middleware/Validation/validationHandler";
const router= Router();
//view count validation
const postViewCountValidation =[
    body("postId").exists().withMessage("PostId field is required").bail().notEmpty().withMessage("PostId can not be empty string"),
]
//get all view count list of blog post 
router.get('/viewcounts',async (req, res) => {
    try {
        const allViewCounts = await prisma.view.findMany();
        return res.status(200).send(allViewCounts)
        
    } catch (error) {
        return res.status(500).send(error)
    }
});
//create new view count entry
router.post('/viewcount',handleValidation(postViewCountValidation),async (req, res) => {
    try {
        const currentIp= ip.address();
        //check if allready viewed on the same ip and blog id 
        const viewCount = await prisma.view.findFirst({
            where:{
                ipAddress:currentIp,
                postId:req.body.postId

            }
        });
        //if not then create new entry and update view count in post 
        if(!viewCount){
            const createdViewCount = await prisma.view.create({
                data:{
                    ipAddress:currentIp,
                    postId:req.body.postId
                }
            });
            const updatedBlogPost = await prisma.post.update({
                where:{
                    id:req.body.postId
                },
                data:{
                    viewCount:{
                        increment:1
                    }
                },
                select:{
                    id:true,
                    viewCount:true
                }
            });
            return res.status(200).send(updatedBlogPost)
        }
        //else return a message that view count has already saved
        return res.status(200).send({message:'Post view count has been updated successfully'})
        
    } catch (error) {
        return res.status(500).send(error)
    }
})

export default router;