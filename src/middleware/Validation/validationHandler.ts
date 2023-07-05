import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

const handleValidation = (validations: Array<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Execute validations
    Promise.all(validations.map(validation => validation.run(req)))
      .then(() => {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
          next();
        } else {
          res.status(400).json({ errors: errors.array() });
        }
      })
      .catch(next);
  };
};

export default handleValidation;
