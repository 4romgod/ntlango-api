import {check} from 'express-validator';

// TODO finish this validator, validate all the inputs for each route
class AuthValidators {
    static register = [
        check('address').notEmpty().withMessage('Must be a valid address'),
        check('birthdate').notEmpty().withMessage('Must be a valid birthdate'),
        check('email').isEmail().withMessage('Must be a valid email address'),
        check('family_name').notEmpty().withMessage('family_name is required'),
        check('given_name').notEmpty().withMessage('given_name is required'),
        check('phone_number').isMobilePhone('any').withMessage('Phone number be a valid'),
        check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    ];

    static login = [
        check('email').isEmail().withMessage('Must be a valid email address'),
        check('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    ];
}

export default AuthValidators;
