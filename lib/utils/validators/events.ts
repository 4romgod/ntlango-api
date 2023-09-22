import {check} from 'express-validator';

const createEvent = [
    check('title').notEmpty().withMessage('Must be a valid title'),
    check('description').notEmpty().withMessage('Must be a valid description'),
];

const updateEvent = [
    check('title').notEmpty().withMessage('Must be a valid title'),
    check('description').notEmpty().withMessage('Must be a valid description'),
];

// TODO finish this validator, validate all the inputs for each route
export default {
    createEvent,
    updateEvent,
};
