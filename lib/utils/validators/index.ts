import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {HttpStatusCode} from '../constants';
import {InvalidArgumentException} from '../exceptions';
import authValidator from './auth';
import eventsValidator from './events';
import profileValidator from './profile';

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

export {authValidator, eventsValidator, profileValidator, isInputValid};
