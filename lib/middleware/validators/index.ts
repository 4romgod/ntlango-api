import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {HttpStatusCode} from '../../utils/constants';
import {InvalidArgumentException} from '../../utils/exceptions';

const isInputValid = (req: Request, res: Response, next: any) => {
    console.log('validating input...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = InvalidArgumentException(errors.array()[0].msg);
        console.log(error);
        return res.status(HttpStatusCode.BAD_REQUEST).json(error);
    }
    console.log('input valid!!');
    next();
};

export {isInputValid};
export {default as AuthValidators} from './auth';
export {default as EventValidators} from './events';
export {default as ProfileValidators} from './profile';
