import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils';
import {HealthCheckState, HealthCheckResponse} from '@ntlango/api-client';

class HealthCheckController {
    static async healthCheck(req: Request, res: Response) {
        try {
            const healthcheck: HealthCheckResponse = {
                uptime: process.uptime(),
                state: HealthCheckState.Healthy,
                timestamp: Date.now(),
            };
            return res.status(HttpStatusCode.OK).json(healthcheck);
        } catch (error) {
            console.error('Error during health check:', error);
            return res.status(HttpStatusCode.INTERNAL_SERVER).json({
                uptime: process.uptime(),
                state: HealthCheckState.Unhealthy,
                timestamp: Date.now(),
            });
        }
    }
}

export default HealthCheckController;
