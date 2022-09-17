import {check} from 'express-validator';

const create = [
    check('title').notEmpty().withMessage('Must be a valid title'),
    check('description').notEmpty().withMessage('Must be a valid description'),
    check('startDate').notEmpty().withMessage('Must be a valid startDate'),
    check('startTime').notEmpty().withMessage('Must be a valid startTime'),
    check('endDate').notEmpty().withMessage('Must be a valid endDate'),
    check('endTime').notEmpty().withMessage('Must be a valid endTime'),
];

const update = [
    check('title').notEmpty().withMessage('Must be a valid title'),
    check('description').notEmpty().withMessage('Must be a valid description'),
    check('startDate').notEmpty().withMessage('Must be a valid startDate'),
    check('startTime').notEmpty().withMessage('Must be a valid startTime'),
    check('endDate').notEmpty().withMessage('Must be a valid endDate'),
    check('endTime').notEmpty().withMessage('Must be a valid endTime'),
];

export default {
    create,
    update,
};
