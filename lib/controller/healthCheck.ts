import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils/constants';
import {MongoDbClient} from '../clients';

class HealthCheckController {
    private mongoDbClient: MongoDbClient;

    constructor(mongoDbClient: MongoDbClient) {
        this.mongoDbClient = mongoDbClient;
    }

    async healthCheck(req: Request, res: Response) {
        try {
            await this.mongoDbClient.connectToDatabase();
            const healthcheck = {
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
            };
            return res.status(HttpStatusCode.OK).json(healthcheck);
        } catch (error) {
            console.error('Error during health check:', error);
            return res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }
}

export default HealthCheckController;
