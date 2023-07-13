import { Router } from "express";
import { prisma, redisClient } from "../..";
import { body } from "express-validator";
import handleValidation from "../../middleware/Validation/validationHandler";
import { uploadSingle } from "../../middleware/Upload/upload";
import fs from "fs";
import path from "path";
import { setOrGetCache } from "../../helper/getOrSetCache";

const router = Router();
//!create post validation
const postValidation = [
  body("slug")
    .exists()
    .withMessage("Slug field is required")
    .bail()
    .notEmpty()
    .withMessage("Slug must be a stringcan not be empty string"),
  body("title")
    .exists()
    .withMessage("Title field is required")
    .bail()
    .notEmpty()
    .withMessage("Title can not be empty string"),
  body("body")
    .exists()
    .withMessage("Body field is required")
    .bail()
    .notEmpty()
    .withMessage("Body can not be empty string"),
  body("authorId")
    .exists()
    .withMessage("AuthorId field is required")
    .bail()
    .notEmpty()
    .withMessage("AuthorId can not be empty string"),
  body("categoryId")
    .exists()
    .withMessage("CategoryId field is required")
    .bail()
    .notEmpty()
    .withMessage("CategoryId can not be empty string"),
  body("postImage").custom((value, { req }) => {
    if (!req?.file?.mimetype.startsWith("image")) {
      throw new Error("Please upload an image file");
    }
    return true;
  }),
];
//!Update post validation
const updatePostValidation = [
  body("slug")
    .optional()
    .notEmpty()
    .withMessage("Slug can not be empty string"),
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title can not be empty string"),
  body("body")
    .optional()
    .notEmpty()
    .withMessage("Body can not be empty string"),
  body("categoryId")
    .optional()
    .notEmpty()
    .withMessage("CategoryId field is required"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tag field must be an array of strings"),
  body("tags.*")
    .optional()
    .notEmpty()
    .withMessage("Each value must be an id of string in the tags array"),
  body("authorId")
    .exists()
    .withMessage("AuthorId field  is required")
    .bail()
    .notEmpty()
    .withMessage("AuthorId can not be empty string"),
  body("postId")
    .exists()
    .withMessage("PosId field is required")
    .bail()
    .notEmpty()
    .withMessage("PostId can not be empty string"),
];
//!Update post image validation
const updatePostImageValidation = [
  body("authorId")
    .exists()
    .withMessage("AuthorId field is required")
    .bail()
    .notEmpty()
    .withMessage("AuthorId can not be empty string"),
  body("postId")
    .exists()
    .withMessage("PosId field is required")
    .bail()
    .notEmpty()
    .withMessage("PostId can not be empty string"),
  body("postImage").custom((value, { req }) => {
    if (!req?.file?.mimetype.startsWith("image")) {
      throw new Error("Please upload an image file");
    }
    return true;
  }),
];
//!filter validation 
const filterValidation = [
  body()
  .custom(value => {
    if (Object.keys(value).length === 0) {
      throw new Error('No filter specified!');
    }
    return true;
  }),
  body("tags.*").optional().trim(),
  body("tags").optional()
    .isArray({ min: 1 })
    .withMessage("Tags field must be a non-empty array of strings")
    .custom((value, { req }) => {
      if (Array.isArray(value) && value.length > 0) {
        // Validate each tag in the array
        for (let tag of value) {
          if (typeof tag !== "string" || tag.trim() === "") {
            throw new Error("Each value must be a non-empty string in the tags array");
          }
        }
      }
      return true;
    }),
    body('sortBy').optional().notEmpty().withMessage('SortBy can not be empty string'),
];
//! where filter type 
export type whereFilterType = {
  [key:string]: unknown | whereFilterType
}
//!orderBy query type 
export type orderByType = {
  [key:string]: 'asc' | 'desc'
}


//*all post with category and search query operation
router.get("/posts", async (req, res) => {
  try {
    //!pagination query
    const page = +(req.query.page as string) || 1;
    const limit = +(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    //** Total post count  */
    const totalPostCount = await prisma.post.count();
    //Total pages for pagination 
    const totalPages = Math.ceil(totalPostCount / limit);
    console.log('total pages', totalPages);

    //!if category and search has value 
    if(req.query.search && req.query.category){
      const allPostWithCategoryAndSearch =  prisma.post.findMany({
        where:{
            title:{
            contains:req.query.search as string,
              mode:'insensitive'
            },
            cateogry:{
              category_name:{
                equals:req.query.category as string,
                mode:'insensitive'
              }
            }
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          comments: {
            select: {
              id: true,
              comment: true,
              authorId: true,
              postId: true,
            },
          },
          tags: {
            select: {
              id: true,
              tag_name: true,
            },
          },
          cateogry:{
            select:{category_name:true}
          }
        },
        skip: offset,
        take: limit,
        
      });
      //!redis function to handle caching 
     await setOrGetCache( req,res,`allPostWithPaginationAndSearchCat:${page} ${limit}${req.query.search}${req.query.category}`,allPostWithCategoryAndSearch,totalPages,300);
     return
      // return res.status(200).send(allPostWithCategoryAndSearch);
    }
    //**all post with search query */
    if(req.query.search){
      const allSearchedPosts =  prisma.post.findMany({
        where:{
            title:{
            contains:req.query.search as string,
              mode:'insensitive'
            }
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          comments: {
            select: {
              id: true,
              comment: true,
              authorId: true,
              postId: true,
            },
          },
          tags: {
            select: {
              id: true,
              tag_name: true,
            },
          },
          cateogry:{
            select:{category_name:true}
          }
        },
        skip: offset,
        take: limit,
        
      });
       //!redis function to handle caching 
     await setOrGetCache( req,res,`allPostWithPaginationAndSearch:${page} ${limit}${req.query.search}`,allSearchedPosts,totalPages,300);
     return 
      // return res.status(200).send(allSearchedPosts);

    }
    //** allposts with category query */
    if(req.query.category){
      const allPostWithCategories =  prisma.post.findMany({
        where:{
            cateogry:{
              category_name:{
                equals:req.query.category as string,
                mode:'insensitive'
              }
            }
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          comments: {
            select: {
              id: true,
              comment: true,
              authorId: true,
              postId: true,
            },
          },
          tags: {
            select: {
              id: true,
              tag_name: true,
            },
          },
          cateogry:{
            select:{category_name:true}
          }
          
        },
        skip: offset,
        take: limit,
        
      });
      //!redis function to handle caching 
     await setOrGetCache( req,res,`allPostWithPaginationAndCat:${page} ${limit}${req.query.category}`,allPostWithCategories,totalPages,300);
     return
      // return res.status(200).send(allPostWithCategories);
    }
    // //!all post without search query
    const allPosts =  prisma.post.findMany({
      orderBy:{
        createdAt:'desc'
      },
    
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            authorId: true,
            postId: true,
          },
          orderBy:{
            createdAt:'desc'
          }
        },
        tags: {
          select: {
            id: true,
            tag_name: true,
          },
        },
        cateogry:{
          select:{category_name:true}
        },
        
      },
      skip: offset,
      take: limit,
    });
    // return res.status(200).send(allPosts);
    //!redis function to handle caching 
     await setOrGetCache( req,res,`allPostWithPagination:${page} ${limit}`,allPosts,totalPages);
  } catch (error) {
    return res.status(500).send(error);
  }
});
//**router to handler dynamic filtering like tag's name,mostLiked,mostViewed etc
router.post('/post/filter',handleValidation(filterValidation),async(req,res)=>{

  try {
    //!pagination query
    const page = +(req.query.page as string) || 1;
    const limit = +(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    let filterQuery:orderByType = {};
    let whereQuery:whereFilterType = {};
    const {sortBy,tags} = req.body;
    let TAG_KEY='';
    if(tags as string[] && tags.length > 0){
        TAG_KEY = tags.join(' ');
        whereQuery.tagId={
          hasSome:tags
        }
    }
    if(sortBy==="mostViewed"){
      filterQuery.viewCount='desc';
    }
    else if(sortBy==="mostLiked"){
      filterQuery.likeCount='desc';
    }
    else if(sortBy==="oneDayAgo"){
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      // console.log('one day ago', oneDayAgo)
      //oneDayAgo.setHours(0, 0, 0, 0); // Set time to midnigh
      whereQuery.createdAt={
        lt:new Date(),
        gte:oneDayAgo
      }
    }
    else if(sortBy==="oneWeekAgo"){
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      // console.log('one week ago',oneWeekAgo)
      //oneWeekAgo.setHours(0, 0, 0, 0); // Set time to midnigh
      whereQuery.createdAt={
        lte:new Date(),
        gte:oneWeekAgo
      }
    }
    else if(sortBy==="oneMonthAgo"){
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      //  ('one month ago',oneMonthAgo)
      //oneMonthAgo.setHours(0, 0, 0, 0); // Set time to midnigh
      whereQuery.createdAt={
        lt:new Date(),
        gte:oneMonthAgo
      }
    }
    else{
      filterQuery.createdAt='desc';
    }
  
    const allPosts =  prisma.post.findMany({
      orderBy:{
        ...filterQuery,
      
      },
       where:{
        // tagId:{
        //   hasSome:req.body.tags || []
        // }
        ...whereQuery
       },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            authorId: true,
            postId: true,
          },
        },
        tags: {
          select: {
            id: true,
            tag_name: true,
          },
        },
        cateogry:{
          select:{category_name:true}
        }
      },
      skip: offset,
      take: limit,
    });
    //!redis function to handle caching 
    await setOrGetCache( req,res,`postSortAndFilter:${page} ${limit} ${sortBy} ${TAG_KEY}`,allPosts);
    //reseting filter query
    // filterQuery={};
    // return res.status(200).send(allPosts);
  } catch (error) {
    return res.status(500).send(error);
  }
});
//*route to create new entry in user model
router.post(
  "/post",
  uploadSingle("postImage"),
  handleValidation(postValidation),
  async (req, res) => {
    try {
      const newPost = await prisma.post.create({
        data: {
          slug: req.body.slug,
          title: req.body.title,
          body: req.body.body,
          authorId: req.body.authorId,
          tagId: req.body.tags,
          postImage: req?.file?.filename as string,
          categoryId: req.body.categoryId,
        },
      });
      //!reset redis cache
      redisClient.flushDb();
      return res.status(201).send(newPost);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

//!router to update post data without blog post image by logged user
router.patch(
  "/post/edit",
  handleValidation(updatePostValidation),
  async (req, res) => {
    try {
      //check if post exist
      const postExist = await prisma.post.findFirst({
        where: { id: req.body.postId, authorId: req.body.authorId },
      });
      if (postExist) {
        const updatedPost = await prisma.post.update({
          where: { id: postExist.id },
          data: {
            slug: req.body.slug || postExist.slug,
            title: req.body.title || postExist.title,
            body: req.body.body || postExist.body,
            categoryId: req.body.categoryId || postExist.categoryId,
            tagId: req.body.tags || postExist.tagId,
          },
        });
        return res.status(200).send(updatedPost);
      } else {
        return res.status(404).send({ message: "No Record Found" });
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);
//!router to update image of the blog post by logged user
router.patch(
  "/post/edit/image",
  uploadSingle("postImage"),
  handleValidation(updatePostImageValidation),
  async (req, res) => {
    try {
      //!check if post exist
      const postExist = await prisma.post.findFirst({
        where: { id: req.body.postId, authorId: req.body.authorId },
      });
      //!throw error
      if (!postExist)
        return res.status(404).send({ message: "Post not found" });
      //!update post image
      const updatedPost = await prisma.post.update({
        where: { id: postExist.id },
        data: {
          postImage: req.file?.filename,
        },
        select: {
          id: true,
          postImage: true,
        },
      });
      return res.status(200).send(updatedPost);
    } catch (error) {
      return res.status(500).send(error);
    }
  }
);

//!get a single post by id
router.get("/post/:id", async (req, res) => {
  try {
    //!check if post exist
    const postExist = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    //!if not found throw error
    if (!postExist) return res.status(404).send({ message: "Post not found" });
   
    const singlePost =  prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            authorId: true,
            postId: true,
          },
        },
        tags: {
          select: {
            id: true,
            tag_name: true,
          },
        },
      },
    });
    //!redis handler 
     await setOrGetCache(req,res,`post:${req.params.id}`,singlePost)
    
  } catch (error) {
    return res.status(500).send(error);
  }
});

//!delete a post by logged user and post id
router.delete("/post/:userId/:postId", async (req, res) => {
  try {
    //!check if post exist
    const postExist = await prisma.post.findFirst({
      where: { id: req.params.postId, authorId: req.params.userId },
    });
    //!if not found throw error
    if (!postExist) {
      return res.status(404).send({ message: "Post not found" });
    } else {
      /*
            Since the post is realted to like,view count ,comments schemas and have a relationship amongs so we need to delete the related entry first then the post itself
            */
      //!check  like entry if exist in the like table
      const isLikedPostExist = await prisma.like.findFirst({
        where: { postId: postExist.id },
      });
      //!check blog post view entry if exist in the view table
      const isViewedPostExist = await prisma.view.findFirst({
        where: { postId: postExist.id },
      });
      //!check comment entry exist with the user's post id
      const isCommentExist = await prisma.comment.findFirst({
        where: { postId: postExist.id },
      });
      //?delete all like entry if exist in the like table
      if (isLikedPostExist) {
        //** delete all the liked entry by the user post */
        await prisma.like.deleteMany({
          where: { postId: isLikedPostExist.postId },
        });
      }
      //?delete all view entry if exist in the view table
      if (isViewedPostExist) {
        //**delete all the view entry by the user post
        await prisma.view.deleteMany({
          where: { postId: isViewedPostExist.postId },
        });
      }
      //?delete all the comments entry for this user's post
      if (isCommentExist) {
        await prisma.comment.deleteMany({
          where: { postId: isCommentExist.postId },
        });
      }
      //** finally  delete the post itself  */
      //!delete post
      const deletedPost = await prisma.post.delete({
        where: { id: postExist.id },
      });
      //!delete uploaded image from the uploads folder
      fs.unlinkSync(path.join(process.cwd(), "uploads", postExist.postImage));
      return res.status(200).send({ message: "Post deleted successfully" });
    }
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default router;
