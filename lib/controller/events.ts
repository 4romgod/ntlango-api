import {Request, Response} from 'express';
import express from 'express';
import {HttpStatusCode} from '../utils/constants';
import {eventsDao} from '../dao';

interface IEventController {
    create: express.Handler;
    read: express.Handler;
    update: express.Handler;
    delete: express.Handler;
    readAll: express.Handler;
    query: express.Handler;
}

const eventsController: IEventController = {
    create: async (req: Request, res: Response, next: any) => {
        try {
            const {title, description, startDate, startTime, endDate, endTime} = req.body;
            const daoRes = await eventsDao.createEvent({title, description, startDate, startTime, endDate, endTime});
            return res.status(HttpStatusCode.OK).json(daoRes[0]);
        } catch (error: any) {
            next(error);
        }
    },

    // TODO Update the function to read actual an event
    read: async (req: Request, res: Response, next: any) => {
        try {
            const {eventId} = req.params;
            return res.status(HttpStatusCode.OK).json({message: `You have successfully read an event with ID: ${eventId}`});
        } catch (error: any) {
            next(error);
        }
    },

    // TODO Update the function to update an actual event
    update: async (req: Request, res: Response, next: any) => {
        try {
            const {eventId} = req.params;
            return res.status(HttpStatusCode.OK).json({message: `You have successfully updated an event with ID: ${eventId}`});
        } catch (error: any) {
            next(error);
        }
    },

    // TODO Update the function to delete an actual event
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

export default eventsController;
