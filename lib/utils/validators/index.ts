import {validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {HttpStatusCode} from '../constants';
import accountValidator from './account';
import eventsValidator from './events';
import {InvalidArgumentException} from '../exceptions';

const isInputValid = (req: Request, res: Response, next: any) => {
    console.log('validating input...');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = InvalidArgumentException(errors.array()[0].msg);
        console.log(error);
        return res.status(HttpStatusCode.BAD_REQUEST).json(error);
    }
    next();
};

export {accountValidator, eventsValidator, isInputValid};
