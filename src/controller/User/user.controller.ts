import { Router } from "express";
import { prisma } from "../..";
import fs from 'fs';
import path from 'path';
import { uploadSingle } from '../../middleware/Upload/upload'
const router = Router();

router.get('/users',async(req,res)=>{
    try {
        const allUsers = await prisma.user.findMany({
            select: {
              id: true,
              name: true,
              email: true,
              posts: {
                select: {
                  id: true,
                  title: true,
                  body: true,
                  authorId: true,
                },
              },
            },
          });
        return res.status(200).send(allUsers)
    } catch (error) {
        return res.status(404).send(error)
    }
})

//!router update user profile 
router.patch('/user/profile/:userId',uploadSingle('avatar'),async(req,res)=>{
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




export default router;