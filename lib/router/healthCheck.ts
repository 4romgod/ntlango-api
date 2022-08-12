import {Router} from 'express';
import healthCheckController from '../controller/healthCheck';

const router = Router();

router.get('/healthcheck', healthCheckController.healthCheck);

export default router;
