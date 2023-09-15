import {Router} from 'express';
import {HealthCheckController} from '../controller';

const router = Router();

router.get('/healthcheck', HealthCheckController.healthCheck);

export default router;
