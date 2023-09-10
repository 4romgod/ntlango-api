import {Router} from 'express';
import {EventController} from '../controller';
import {eventsValidator, isInputValid} from '../utils/validators';
import {EventDAO} from '../dao';

const router = Router();
const eventDAO = new EventDAO();
const eventController = new EventController(eventDAO);

router.post('/events', eventsValidator.createEvent, isInputValid, eventController.createEvent);
router.get('/events', eventController.getEvents);
router.get('/events/:eventId', eventController.getEventById);
router.get('/eventd/slug/:slug', eventController.getEventBySlug);
// router.get('/events', eventController.queryEvents); TODO fix this

export default router;
