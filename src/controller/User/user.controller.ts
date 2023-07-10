import { Router } from "express";
import { prisma } from "../..";
import fs from 'fs';
import path from 'path';
import { uploadSingle } from '../../middleware/Upload/upload'
import { body } from "express-validator";
import handleValidation from "../../middleware/Validation/validationHandler";
const router = Router();
//!user profile picture update validation 
const userProfileValidation =[
  body("avatar").custom((value,{req})=>{
    // if (!req.file) {
    //   throw new Error('File is required');
    // }
    if (!req?.file?.mimetype.startsWith("image")) {
      throw new Error("Please upload an image file");
    }
    return true;
  })
]
//!user informatin  without picture validation
const userWithoutPictureValidation =[
  body().custom((value,{req})=>{
    if(Object.keys(req.body).length === 0){
      throw new Error('Please provide at least one field to update')
    }
    return true;
  }),
  body('name').trim().optional().notEmpty().withMessage('Name field can not be empty').bail().matches(/^[a-zA-Z ]+$/).withMessage('Name must be alphabets only'),
]

router.get('/users',async(req,res)=>{
  //!pagination query
  const page = +(req.query.page as string) || 1;
  const limit = +(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
    try {
      //!if req.query has send 
        const allUsers = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              posts: {
                select: {
                  id: true,
                  title: true,
                  body: true,
                  authorId: true,
                },
              },
            },
            skip:offset,
            take:limit,
          });
        return res.status(200).send(allUsers)
    } catch (error) {
        return res.status(404).send(error)
    }
})

//!router update user profile picture
router.patch('/user/profile/:userId',uploadSingle('avatar'),handleValidation(userProfileValidation),async(req,res)=>{
  try {
     //get current user 
      const currentUser = await prisma.user.findUnique({
        where:{
          id:req.params.userId
        }
      });
      //update user profile and remove old uploaded image 
      const updatedUser = await prisma.user.update({
        where:{
          id:req.params.userId
        },
        data:{
          avatar:req?.file?.filename
        },
        select:{
          id:true,
          avatar:true
        }
      })
      //if profile updated successfully and there is an old image then delete it
      if (updatedUser && currentUser?.avatar) {
        const deletePath = path.join(process.cwd(), "uploads", currentUser.avatar);
        try {
          fs.unlinkSync(deletePath);
          // console.log("Old profile image deleted:", deletePath);
        } catch (error) {
          console.error("Error deleting old profile image:", error);
        }
      }
      return res.status(200).send(updatedUser)
  } catch (error) {
    return res.status(500).send(error)
  }
})

//!get single user info
router.get('/user/:userId',async(req,res)=>{
  try {
        const user= await prisma.user.findUnique({
          where:{id:req.params.userId},
          select:{
            id:true,
            name:true,
            avatar:true,
            email:true,
            posts: {
              select: {
                id: true,
                title: true,
                body: true,
                authorId: true,
              },
            },
          }
        })
        return res.status(200).send(user);
  } catch (error) {
    return res.status(500).send(error)
  }
})
//!delete single user 
router.delete('/user/:userId',async(req,res)=>{
  try {
     //!find user if exist or not
    const user = await prisma.user.findUnique({
      where:{id:req.params.userId}
    })
    //!if user not exist then return error
    if(!user){
      return res.status(404).send({message:'User not found'})
    }
    const deletedUser = await prisma.user.delete({
      where:{id:req.params.userId}
    })
    return res.status(200).send({message:"User deleted successfully"})
  } catch (error) {
    return res.status(500).send(error)
  }
})

//!update user profile info except profile picture
router.patch('/user/:userId',handleValidation(userWithoutPictureValidation),async(req,res)=>{
  try {
    const updatedUser = await prisma.user.update({
      where:{id:req.params.userId},
      data:{
        name:req.body.name
      },
      select:{
        id:true,
        name:true,
        avatar:true,
        email:true
      }
    })
    return res.status(200).send(updatedUser)
  } catch (error) {
    return res.status(500).send(error)
  }
})




export default router;