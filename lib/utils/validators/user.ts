import {check, validationResult} from 'express-validator';
import {Request, Response} from 'express';
import {HttpStatusCode} from '../constants';
import {REGEX} from '../constants';

const signUp = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('address').notEmpty().withMessage('Must be a valid address'),
    check('gender').notEmpty().withMessage('Must be a valid gender'),
    check('given_name').notEmpty().withMessage('given_name is required'),
    check('family_name').notEmpty().withMessage('family_name is required'),
    check('birthdate').notEmpty().withMessage('Must be a valid birthdate'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const confirmSignUp = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('code').isLength({min: 6}).withMessage('Invalid confirmation code'),
];

const signIn = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const updateUserAttributes = [
    check('Authorization')
        .notEmpty()
        .withMessage('No Authorization headers provided')
        .matches(REGEX.ACCESS_TOKEN)
        .withMessage('Invalid access token provided'),

    check('attributes').notEmpty().withMessage('Provide Atleast One Attribute'),
    check('attributes.*.Name').exists().notEmpty().withMessage('Provide a valid "Name" parameter'),
    check('attributes.*.Value').exists().notEmpty().withMessage('Provide a valid "Value" parameter'),
];

const forgotPassword = [check('email').isEmail().withMessage('Must be a valid email address')];

const confirmForgotPassword = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('code').isLength({min: 6}).withMessage('Invalid confirmation code'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const removeAccount = [
    check('Authorization')
        .notEmpty()
        .withMessage('No Authorization headers provided')
        .matches(REGEX.ACCESS_TOKEN)
        .withMessage('Invalid access token provided'),
];

const isInputValid = (req: Request, res: Response, next: any) => {
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
    updateUserAttributes,
    forgotPassword,
    confirmForgotPassword,
    removeAccount,
    isInputValid,
};
