import { Router, Request, Response, NextFunction } from "express";
import { prisma, redisClient } from "../..";
import { body } from "express-validator";
import handleValidation from "../../middleware/Validation/validationHandler";
import  authenticate  from "../../middleware/Authentication/authenticate";
import { deleteKeysByPattern } from "../../helper/deleteKyesByPattern";
const router = Router();
//!liked post validation
const likePostValidation = [
  body("postId")
    .exists()
    .withMessage("PostId field is required")
    .bail()
    .notEmpty()
    .withMessage("PostId can not be empty string"),
  body("authorId")
    .exists()
    .withMessage("AuthorId field is required")
    .bail()
    .notEmpty()
    .withMessage("AuthorId can not be empty string"),
];
//get all liked post
router.get("/likes", async (req, res) => {
  try {
    const allLikedPost = await prisma.like.findMany();
    return res.status(200).send(allLikedPost);
  } catch (error) {
    return res.status(500).send(error);
  }
});
//create new liked post entry
router.post(
  "/like",
 authenticate() as any,
  handleValidation(likePostValidation),
  async (req: Request, res: Response,next:NextFunction) => {
    try {
      //!check if a post has already liked by the user
      const { authorId, postId } = req.body;
      const likePost = await prisma.like.findFirst({
        where: {
          authorId,
          postId,
        },
      });
      //!reseting redis cache 
      redisClient.flushAll();
      //  await deleteKeysByPattern(`allPostWithPagination:*`);
      //  await deleteKeysByPattern("post:*")
      //if yes then decrement like count by one and update isLiked status to false
      if (likePost) {
        const updatedLikedPost = await prisma.like.update({
          where: {
            id: likePost.id,
          },
          data: {
            isLiked: !likePost.isLiked,
          },
        });

        //!increment preveous like counnt based on isLiked status
        const incrementLikeCount = updatedLikedPost.isLiked ? 1 : -1;
        const updatedBlogPost = await prisma.post.update({
          where: {
            id: likePost.postId,
          },
          data: {
            likeCount: {
              increment: incrementLikeCount,
            },
          },
          select: {
            id: true,
            likeCount: true,
          },
        });
        return res.status(200).send(updatedBlogPost);
      }
      //!create new entry with the user id and post id
      else {
        const createdLikedPost = await prisma.like.create({
          data: {
            authorId,
            postId,
            isLiked: true,
          },
        });

        const updatedBlogPost = await prisma.post.update({
          where: {
            id: createdLikedPost.postId,
          },
          data: {
            likeCount: {
              increment: 1,
            },
          },
          select: {
            id: true,
            likeCount: true,
          },
        });

        return res.status(200).send(updatedBlogPost);
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

export default router;
