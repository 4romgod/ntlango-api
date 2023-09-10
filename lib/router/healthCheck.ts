import {Router} from 'express';
import {HealthCheckController} from '../controller';
import {MongoDbClient} from '../clients';
import {MONGO_DB_URL} from '../utils/constants';

const mongoDbClient = new MongoDbClient(MONGO_DB_URL);
const healthCheckController = new HealthCheckController(mongoDbClient);

const router = Router();

router.get('/healthcheck', healthCheckController.healthCheck);

export default router;
