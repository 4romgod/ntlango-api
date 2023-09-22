import {check} from 'express-validator';
import {REGEX} from '../constants';

const updateProfile = [
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

const removeProfile = [
    check('Authorization')
        .notEmpty()
        .withMessage('No Authorization headers provided')
        .matches(REGEX.ACCESS_TOKEN)
        .withMessage('Invalid access token provided'),
];

const adminRemoveProfile = [check('username').notEmpty().withMessage('Provide A Username')];

// TODO finish this validator, validate all the inputs for each route
export default {
    updateProfile,
    forgotPassword,
    confirmForgotPassword,
    removeProfile,
    adminRemoveProfile,
};
