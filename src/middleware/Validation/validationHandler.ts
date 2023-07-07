import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import fs from 'fs'
import path from 'path';

const handleValidation = (validations: Array<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute validations
    Promise.all(validations.map(validation => validation.run(req)))
      .then(() => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          next();
        } else {
          //!checking if there is a file uploaded but still there was some missing filed error so delete the uploaded file to prevent unnecessary store
          if(req.file){
            fs.unlinkSync(path.join(process.cwd(),"uploads",req.file.filename));
            console.log('deleted uploaded file when there is validation error ')
          } 
          res.status(400).json({ errors: errors.array() });
        }
      })
      .catch(next);
  };
};

export default handleValidation;
