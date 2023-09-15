import {Request, Response} from 'express';
import {HttpStatusCode, MONGO_DB_URL} from '../utils/constants';
import {MongoDbClient} from '../clients';

class HealthCheckController {
    async healthCheck(req: Request, res: Response) {
        try {
            await MongoDbClient.connectToDatabase(MONGO_DB_URL);
            const healthcheck = {
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
            };
            await MongoDbClient.disconnectFromDatabase();
            return res.status(HttpStatusCode.OK).json(healthcheck);
        } catch (error) {
            console.error('Error during health check:', error);
            return res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }
}

export default HealthCheckController;
