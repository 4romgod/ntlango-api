import {Request, Response} from 'express';
import express from 'express';

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
        res.status(200).json(healthcheck);
    },
};

export default healthCheckController;
