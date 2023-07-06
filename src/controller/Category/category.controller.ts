import Router from 'express'
import { prisma } from '../..';
import { body } from 'express-validator';
import handleValidation from '../../middleware/Validation/validationHandler';
const router = Router();
//!Validation for category 
const createCategoryValidation=[
    body('category_name').exists().withMessage('Category field  is required').notEmpty().withMessage('Category name must can not be empty')
]
//!get all category routes
router.get('/categories', async(req, res) => {
    try {
        const allCategories = await prisma.category.findMany();
        return res.status(200).send(allCategories);
    } catch (error) {
        return res.status(500).send(error)
    }
});

//!create new category 
router.post('/category',handleValidation(createCategoryValidation), async(req, res) => {
    try {
        //!check if category already exist
        const categoryExist = await prisma.category.findFirst({
            where:{
                category_name:req.body.category_name
            }
        });
        //!if category exist return error
        if(categoryExist) return res.status(400).send({message:'Category already exist'});
        //!if category not exist create new category
        const newCategory = await prisma.category.create({
            data:{
                 category_name: req.body.category_name
            }
        });
        //!return new category
        return res.status(201).send(newCategory);
        
    } catch (error) {
        return res.status(500).send(error);
    }
});

export default router;