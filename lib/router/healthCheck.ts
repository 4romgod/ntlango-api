import {Router} from 'express';
import {HealthCheckController} from '../controller';

const healthCheckController = new HealthCheckController();

const router = Router();

router.get('/healthcheck', healthCheckController.healthCheck);

export default router;
