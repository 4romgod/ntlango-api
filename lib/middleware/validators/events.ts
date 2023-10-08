import {EventCategory, EventPrivacySetting, EventStatus, EventType} from '@ntlango/api-client';
import {check, query} from 'express-validator';
import {InvalidArgumentException} from '../../utils/exceptions';

const isProjectionsPattern = (value: string | undefined) => {
    if (!value) {
        return true;
    }
    const projectionPattern = /^[a-zA-Z0-9_]+(,[a-zA-Z0-9_]+)*$/;
    if (!projectionPattern.test(value)) {
        throw InvalidArgumentException('Invalid projections format. Use a comma-separated string (e.g., "title,description,startDate")');
    }
    return true;
};

// TODO ADD all validators
class EventValidators {
    static createEvent = [
        check('title').notEmpty().withMessage('Title is required'),
        check('description').notEmpty().withMessage('Description is required'),
        check('startDate').optional().isISO8601().withMessage('Invalid start date format. Use ISO8601 format.'),
        check('endDate').optional().isISO8601().withMessage('Invalid end date format. Use ISO8601 format.'),
        check('location').optional().isString().notEmpty().withMessage('Location should be a non-empty string when provided'),
        check('organizers').optional().isArray().withMessage('Organizers should be an array'),
        check('eventType')
            .optional()
            .isIn(Object.values(EventType))
            .withMessage('Invalid eventType. Must be one of: Concert, Conference, Networking, Party, Sport, Workshop, Other'),
        check('eventCategory')
            .optional()
            .isIn(Object.values(EventCategory))
            .withMessage('Invalid eventCategory. Must be one of: Arts, Music, Technology, Health, FoodAndDrink, Travel, Other'),
        check('capacity').optional().isInt({min: 0}).withMessage('Capacity should be a positive integer'),
        check('rSVPs').optional().isArray().withMessage('RSVPs should be an array'),
        check('tags').optional().isObject().withMessage('Tags should be an object'),
        check('eventLink').optional().isURL().withMessage('Invalid event link. Should be a URL'),
        check('status')
            .optional()
            .isIn(Object.values(EventStatus))
            .withMessage('Invalid status. Must be one of: Cancelled, Completed, Ongoing, Upcoming'),
        check('media').optional().isObject().withMessage('Media should be an object'),
        check('additionalDetails').optional().isObject().withMessage('Additional details should be an object'),
        check('comments').optional().isObject().withMessage('Comments should be an object'),
        check('privacySetting')
            .optional()
            .isIn(Object.values(EventPrivacySetting))
            .withMessage('Invalid privacySetting. Must be one of: Public, Private, Invitation'),
    ];

    static updateEvent = [
        check('title').optional().notEmpty().withMessage('Invalid Title entered'),
        check('description').optional().notEmpty().withMessage('Invalid Description entered'),
        check('startDate').optional().isISO8601().withMessage('Invalid start date format. Use ISO8601 format.'),
        check('endDate').optional().isISO8601().withMessage('Invalid end date format. Use ISO8601 format.'),
        check('location').optional().isString().notEmpty().withMessage('Location should be a non-empty string when provided'),
        check('organizers').optional().isArray().withMessage('Organizers should be an array'),
        check('eventType')
            .optional()
            .isIn(Object.values(EventType))
            .withMessage('Invalid eventType. Must be one of: Concert, Conference, Networking, Party, Sport, etc.'),
        check('eventCategory')
            .optional()
            .isIn(Object.values(EventCategory))
            .withMessage('Invalid eventCategory. Must be one of: Arts, Music, Technology, Health, etc.'),
        check('capacity').optional().isInt({min: 0}).withMessage('Capacity should be a positive integer'),
        check('rSVPs').optional().isArray().withMessage('RSVPs should be an array'),
        check('tags').optional().isObject().withMessage('Tags should be an object'),
        check('eventLink').optional().isURL().withMessage('Invalid event link. Should be a URL'),
        check('status').optional().isIn(Object.values(EventStatus)).withMessage('Invalid status. Must be one of: Cancelled, Completed, etc.'),
        check('media').optional().isObject().withMessage('Media should be an object'),
        check('additionalDetails').optional().isObject().withMessage('Additional details should be an object'),
        check('comments').optional().isObject().withMessage('Comments should be an object'),
        check('privacySetting')
            .optional()
            .isIn(Object.values(EventPrivacySetting))
            .withMessage('Invalid privacySetting. Must be one of: Public, Private, Invitation'),
    ];

    static readEventById = [
        check('eventId').notEmpty().withMessage('Event ID is required').isString().withMessage('Event ID should be a string'),
        query('projections').optional().isString().withMessage('Projections should be a string').custom(isProjectionsPattern),
    ];

    static readEvents = [
        check('title').optional().notEmpty().withMessage('Invalid Title entered'),
        check('description').optional().notEmpty().withMessage('Invalid Description entered'),
        check('startDate').optional().isISO8601().withMessage('Invalid start date format. Use ISO8601 format.'),
        check('endDate').optional().isISO8601().withMessage('Invalid end date format. Use ISO8601 format.'),
        check('location').optional().isString().notEmpty().withMessage('Location should be a non-empty string when provided'),
        check('organizers').optional().notEmpty().withMessage('Invalid Organizers entered'),
        check('tags').optional().notEmpty().withMessage('Invalid Tags entered'),
        check('eventType')
            .optional()
            .isIn(Object.values(EventType))
            .withMessage('Invalid eventType. Must be one of: Concert, Conference, Networking, Party, Sport, etc.'),
        check('eventCategory')
            .optional()
            .isIn(Object.values(EventCategory))
            .withMessage('Invalid eventCategory. Must be one of: Arts, Music, Technology, Health, etc.'),
        check('capacity').optional().isInt({min: 0}).withMessage('Capacity should be a positive integer'),
        check('rSVPs').optional().notEmpty().withMessage('Invalid RSVPs entered'),
        check('status').optional().isIn(Object.values(EventStatus)).withMessage('Invalid status. Must be one of: Cancelled, Completed, etc.'),
        check('privacySetting')
            .optional()
            .isIn(Object.values(EventPrivacySetting))
            .withMessage('Invalid privacySetting. Must be one of: Public, Private, Invitation'),
        query('projections').optional().isString().withMessage('Projections should be a string').custom(isProjectionsPattern),
    ];
}

export default EventValidators;
