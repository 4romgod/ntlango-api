import {check, validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {HttpStatusCode} from '../constants';

const signUp = [
    check('firstName').not().isEmpty().withMessage('firstName is required'),
    check('lastName').not().isEmpty().withMessage('lastName is required'),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const confirmSignUp = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('code').isLength({min: 6}).withMessage('Invalid verification code'),
];

const signIn = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const isInputValid = (req: Request, res: Response, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HttpStatusCode.BAD_REQUEST).json({error: errors.array()[0].msg});
    }
    next();
};

export default {
    signUp,
    confirmSignUp,
    signIn,
    isInputValid,
};
