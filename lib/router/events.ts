import {Router} from 'express';
import {eventController} from '../controller';
import {eventsValidator, isInputValid} from '../utils/validators';

const router = Router();

router.post('/events', eventsValidator.create, isInputValid, eventController.create);
router.get('/events', eventController.readAll);
// router.get('/events', eventController.query);
router.get('/events/:eventId', eventController.read);
router.put('/events/:eventId', eventsValidator.create, isInputValid, eventController.update);
router.delete('/events/:eventId', eventController.delete);

export default router;
