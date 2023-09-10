import {check} from 'express-validator';

const createEvent = [
    check('title').notEmpty().withMessage('Must be a valid title'),
    check('description').notEmpty().withMessage('Must be a valid description'),
];

const updateEvent = [
    check('title').notEmpty().withMessage('Must be a valid title'),
    check('description').notEmpty().withMessage('Must be a valid description'),
];

export default {
    createEvent,
    updateEvent,
};
