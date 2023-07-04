import Router from 'express'
import { prisma } from '../..';
const router = Router()

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
        return res.status(500).send(error)
    }
});
//create new comment route 
router.post('/comment',async(req,res)=>{
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