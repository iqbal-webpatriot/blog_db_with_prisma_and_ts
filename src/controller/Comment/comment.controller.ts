import Router from 'express'
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
export default router;