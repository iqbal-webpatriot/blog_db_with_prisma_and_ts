import path from 'path'
import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
//?file filter type 
 type multerFileType= Express.Multer.File
 //multer callback type
 type  multerCallBackType= multer.FileFilterCallback
// *? creating disk storage 
const storage= multer.diskStorage({
     destination: function(req:Request,file:multerFileType,cb){
       cb(null,path.join(process.cwd(),'uploads'))
     },
     filename:function(req:Request,file:multerFileType,cb){
        // ** unique string sequence to save file in uploads dir
        const uniquePrefix = Date.now()+ Math.random().toString();
        cb(null, uniquePrefix+file.originalname);
     }
})

// *? fileFilter method to check file type while uploading process

const fileFilter=  function(req:Request,file:multerFileType,cb:multerCallBackType){
    if(file.mimetype==='image/jpeg' || file.mimetype==='image/png'|| file.mimetype==='image/jpg'){
        cb(null,true)
    }
    else{
        cb(null,false)
    }

}

// ? upload instance 
const upload= multer({
    storage,
    limits:{
        fileSize:1024*1024*5 // 5mb
    } ,
    fileFilter
})


// single file upload method 

 export const uploadSingle=function(fileKey:string){
    // returning a middleware function 
    return function(req:Request,res:Response,next:NextFunction){
        const uploadItem= upload.single(fileKey);
        uploadItem(req,res,function(err){
            if(err instanceof multer.MulterError){
                // a multer error has occured while uploading
              
                return res.status(500).send(err)
            }
           else if(err){
                // an unknown error has occured
               
                return res.status(500).send(err)
            }
            else {
                // everything is ok and return 
                return next()
            }
        })
    }
 }
//? upload mulitple file method
export const uploadMultiple=function(fileKey:string){
    // returning a middleware function 
    return function(req:Request,res:Response,next:NextFunction){
       
        const uploadItems= upload.array(fileKey,10);
        uploadItems(req,res,function(err){
            if(err instanceof multer.MulterError){
                // a multer error has occured while uploading
                
                return res.status(500).send(err)
            }
           else if(err){
                // an unknown error has occured
                
                return res.status(500).send(err)
            }
            else {
                // everything is ok and return 
                
                return next()
            }
        })
    }
 }
