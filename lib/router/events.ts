import {Router} from 'express';
import {EventController} from '../controller';
import {eventsValidator, isInputValid} from '../utils/validators';

const router = Router();

router.post('/events', eventsValidator.createEvent, isInputValid, EventController.createEvent);
router.get('/events', EventController.getEvents);
router.get('/events/:eventId', EventController.getEventById);
router.put('/events/:eventId', EventController.updateEvent);
router.delete('/events/:eventId', EventController.deleteEvent);
router.post('/events/:eventId/rsvp', EventController.rsvpToEvent);
router.post('/events/:eventId/cancelrsvp', EventController.cancelRsvpToEvent);

export default router;
