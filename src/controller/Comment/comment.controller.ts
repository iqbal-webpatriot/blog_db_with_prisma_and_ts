import { AuthenticatedRequest } from './../../middleware/Authentication/authenticate';
import Router ,{Response,Request}from 'express'
import { prisma } from '../..';
import { body } from 'express-validator';
import handleValidation from '../../middleware/Validation/validationHandler';
const router = Router()
//!comment validations query 
const commentValidation = [
    body('comment')
      .exists().withMessage('Comment field is required')
      .bail()
      .notEmpty().withMessage('Comment can not be empty string'),
    body('postId')
      .exists().withMessage('PostId field is required')
      .bail()
      .notEmpty().withMessage('PostId can not be empty string'),
    body('authorId')
      .exists().withMessage('AuthorId field is required')
      .bail()
      .notEmpty().withMessage('AuthorId can not be empty string'),
  ];
  
  
  
//get all comments route 
router.get('/comments',async(req,res)=>{

    try {
        const allComments= await prisma.comment.findMany({
            include:{
                author:{
                    select:{
                        id: true,
                        email:true,
                        name:true,
                    }
                }
                ,
                post:{
                    select:{
                        id:true,
                        title:true,
                    }
                }
            }
        });
            return res.status(200).send(allComments)

        
    } catch (error) {
        console.log('error ',error)
        return res.status(500).send(error)
    }
});
//create new comment route 
router.post('/comment',handleValidation(commentValidation),async(req,res)=>{
    
    try {
        const newComment = await prisma.comment.create({
            data:{
                comment:req.body.comment,
                postId:req.body.postId,
                authorId:req.body.authorId,

            }
        })
        return res.status(201).send(newComment)
    } catch (error) {
        return res.status(500).send(error)
    }
})
//!update comment by the logged user 
router.patch('/comment/edit',async(req:Request,res:Response)=>{
    try {
        //!find comment done by the user
        const {userId,postId,comment}=req.body;
        //  const user= req.user
        const commentByUser = await prisma.comment.findFirst({
            where: {
                postId,
                authorId:userId
            }
        });
        //*if not found throw error 
        if(!commentByUser)return res.status(404).send({message:"No Record Found"});
        //*if found then update the comment
        const updatedComment = await prisma.comment.update({
            where:{
                id:commentByUser.id
            },
            data:{
                comment
            },
        
        });
        return res.status(200).send(updatedComment)
        
    } catch (error) {
        return res.status(500).send(error);
    }
})
//!delete comment by the logged user 
router.delete('/comment/:userId/:postId',async(req:Request,res:Response)=>{
    try {
        //!find comment done by the user
        const {userId,postId}=req.params;
        //  const user= req.user
        const commentByUser = await prisma.comment.findFirst({
            where: {
                postId,
                authorId:userId
            }
        });
        //*if not found throw error 
        if(!commentByUser)return res.status(404).send({message:"No Record Found"});
        //*if found then update the comment
        const updatedComment = await prisma.comment.delete({
            where:{
                id:commentByUser.id
            },
        
        });
        return res.status(200).send({message:"Comment deleted successfully"})
        
    } catch (error) {
        return res.status(500).send(error);
    }
})

export default router;