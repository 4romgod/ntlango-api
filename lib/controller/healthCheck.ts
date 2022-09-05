import {Request, Response} from 'express';
import express from 'express';
import {HttpStatusCode} from '../utils/constants';

interface IHealthCheckController {
    healthCheck: express.Handler;
}

const healthCheckController: IHealthCheckController = {
    healthCheck: async (req: Request, res: Response) => {
        const healthcheck = {
            uptime: process.uptime(),
            message: 'OK',
            timestamp: Date.now(),
        };
        return res.status(HttpStatusCode.OK).json(healthcheck);
    },
};

export default healthCheckController;
