import {Request, Response} from 'express';
import express from 'express';
import {HttpStatusCode} from '../utils/constants';
import {neo4jClient} from '../clients';

interface IEventController {
    create: express.Handler;
    read: express.Handler;
    update: express.Handler;
    delete: express.Handler;
    readAll: express.Handler;
    query: express.Handler;
}

const eventController: IEventController = {
    create: async (req: Request, res: Response, next: any) => {
        try {
            const {title, description, startDate, startTime, endDate, endTime} = req.body;
            const eventId = 'someRandomId';
            const query = `CREATE (event:EVENT {
                eventId: $eventId, title: $title, description: $description, startDate: $startDate, startTime: $startTime, endDate: $endDate, endTime: $endTime
            }) RETURN event`;
            const neo4jRes = await neo4jClient.executeCypherQuery(query, {eventId, title, description, startDate, startTime, endDate, endTime});
            console.log(neo4jRes);
            return res.status(HttpStatusCode.OK).json({message: 'You have successfully created an event'});
        } catch (error: any) {
            next(error);
        }
    },

    read: async (req: Request, res: Response, next: any) => {
        try {
            const {eventId} = req.params;
            return res.status(HttpStatusCode.OK).json({message: `You have successfully read an event with ID: ${eventId}`});
        } catch (error: any) {
            next(error);
        }
    },

    update: async (req: Request, res: Response, next: any) => {
        try {
            const {eventId} = req.params;
            return res.status(HttpStatusCode.OK).json({message: `You have successfully updated an event with ID: ${eventId}`});
        } catch (error: any) {
            next(error);
        }
    },

    delete: async (req: Request, res: Response, next: any) => {
        try {
            const {eventId} = req.params;
            return res.status(HttpStatusCode.OK).json({message: `You have successfully deleted an event with ID: ${eventId}`});
        } catch (error: any) {
            next(error);
        }
    },

    readAll: async (req: Request, res: Response, next: any) => {
        try {
            return res.status(HttpStatusCode.OK).json({message: 'You have successfully read all events'});
        } catch (error: any) {
            next(error);
        }
    },

    query: async (req: Request, res: Response, next: any) => {
        try {
            return res.status(HttpStatusCode.OK).json({message: 'You have successfully queried events'});
        } catch (error: any) {
            next(error);
        }
    },
};

export default eventController;
