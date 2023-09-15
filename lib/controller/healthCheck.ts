import {Request, Response} from 'express';
import {HttpStatusCode, MONGO_DB_URL} from '../utils/constants';
import {MongoDbClient} from '../clients';

class HealthCheckController {
    static async healthCheck(req: Request, res: Response) {
        try {
            await MongoDbClient.connectToDatabase(MONGO_DB_URL);
            const healthcheck = {
                uptime: process.uptime(),
                message: 'healthy',
                timestamp: Date.now(),
            };
            await MongoDbClient.disconnectFromDatabase();
            return res.status(HttpStatusCode.OK).json(healthcheck);
        } catch (error) {
            console.error('Error during health check:', error);
            return res.status(HttpStatusCode.INTERNAL_SERVER).json({
                uptime: process.uptime(),
                message: 'unhealthy',
                timestamp: Date.now(),
            });
        }
    }
}

export default HealthCheckController;
