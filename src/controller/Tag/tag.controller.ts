import Router from 'express'
import { prisma } from '../..';
import { body } from 'express-validator';
import handleValidation from '../../middleware/Validation/validationHandler';
const router=Router();
//!tag validation 
const tagValidation=[
    body('tag_name').trim().exists().withMessage('Tag field is required').bail().notEmpty().withMessage('Tag name can not be empty string')
]
//!get all tags route
router.get('/tags',async(req,res)=>{
    try {
        const allTags= await prisma.tag.findMany({
            include:{
                posts: false,
            
            }
        });
        return res.status(200).send(allTags);
        
    } catch (error) {
        return res.status(500).send(error)
    }
})
//!create new tag route
router.post('/tag',handleValidation(tagValidation),async(req,res)=>{
    try {
        //!check if tag already exists
        const tagExists= await prisma.tag.findFirst({
            where:{
                tag_name:req.body.tag_name
            }
        })
        if(tagExists) return res.status(400).send({message:"Tag already exist"})

        const newTag= await prisma.tag.create({
            data:{
                tag_name:req.body.tag_name
            }
        });
        return res.status(200).send(newTag);
    } catch (error) {
        return res.status(500).send(error)
    }

})


export default router;