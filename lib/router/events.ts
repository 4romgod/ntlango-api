import {Router} from 'express';
import {EventController} from '../controller';
import {EventValidators, isInputValid} from '../middleware/validators';
import {EventPreprocess} from '../middleware/preprocess';

const router = Router();

router.post('/events', EventValidators.createEvent, isInputValid, EventController.createEvent);
router.get('/events', EventValidators.readEvents, isInputValid, EventPreprocess.readEvents, EventController.getEvents);
router.get('/events/:eventId', EventController.getEventById);
router.put('/events/:eventId', EventValidators.updateEvent, isInputValid, EventController.updateEvent);
router.delete('/events/:eventId', EventController.deleteEvent);
router.put('/events/:eventId/rsvp', EventController.rsvpToEvent);
router.put('/events/:eventId/cancelrsvp', EventController.cancelRsvpToEvent);

export default router;
