import {Router} from 'express';
import {healthCheckController} from '../controller';

const router = Router();

router.get('/healthcheck', healthCheckController.healthCheck);

export default router;
