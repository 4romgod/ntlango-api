import {check} from 'express-validator';
import {REGEX} from '../constants';

const register = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('address').notEmpty().withMessage('Must be a valid address'),
    check('gender').notEmpty().withMessage('Must be a valid gender'),
    check('given_name').notEmpty().withMessage('given_name is required'),
    check('family_name').notEmpty().withMessage('family_name is required'),
    check('birthdate').notEmpty().withMessage('Must be a valid birthdate'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const signIn = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const update = [
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

const adminRemoveAccount = [check('username').notEmpty().withMessage('Provide A Username')];

export default {
    register,
    signIn,
    update,
    forgotPassword,
    confirmForgotPassword,
    removeAccount,
    adminRemoveAccount,
};
