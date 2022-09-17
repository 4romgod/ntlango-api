import {Router} from 'express';
import {eventsController} from '../controller';
import {eventsValidator, isInputValid} from '../utils/validators';

const router = Router();

router.post('/events', eventsValidator.create, isInputValid, eventsController.create);
router.get('/events', eventsController.readAll);
// router.get('/events', eventController.query);
router.get('/events/:eventId', eventsController.read);
router.put('/events/:eventId', eventsValidator.create, isInputValid, eventsController.update);
router.delete('/events/:eventId', eventsController.delete);

export default router;
