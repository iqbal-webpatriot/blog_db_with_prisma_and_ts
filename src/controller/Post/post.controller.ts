import { Router } from "express";
import { prisma } from "../..";
import { body } from "express-validator";
import handleValidation from "../../middleware/Validation/validationHandler";
const router = Router();
//!create post validation
const postValidation = [
    body('slug').exists().withMessage('Slug field is required').bail().notEmpty().withMessage('Slug must be a stringcan not be empty string'),
    body('title').exists().withMessage('Title field is required').bail().notEmpty().withMessage('Title can not be empty string'),
    body('body').exists().withMessage('Body field is required').bail().notEmpty().withMessage('Body can not be empty string'),
    body('authorId').exists().withMessage('AuthorId field is required').bail().notEmpty().withMessage('AuthorId can not be empty string'),



]
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
                tags:true
                
            }
        });
        return res.status(200).send(allPosts)
    } catch (error) {
        return res.status(404).send(error)
    }
})
//route to create new entry in user model 
router.post('/post',handleValidation(postValidation),async(req,res)=>{
    try {
        const newUser= await prisma.post.create({
        data:{
          slug:req.body.slug,
          title:req.body.title,
          body:req.body.body,
         authorId:req.body.authorId,
         tagId:req.body.tags

        } 
        })
        return res.status(201).send(newUser)
    } catch (error) {
        
        return res.status(500).send(error)
    }
})




export default router;