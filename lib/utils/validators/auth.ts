import {check} from 'express-validator';

const register = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('address').notEmpty().withMessage('Must be a valid address'),
    check('gender').notEmpty().withMessage('Must be a valid gender'),
    check('given_name').notEmpty().withMessage('given_name is required'),
    check('family_name').notEmpty().withMessage('family_name is required'),
    check('birthdate').notEmpty().withMessage('Must be a valid birthdate'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

const login = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
];

export default {
    register,
    login,
};
