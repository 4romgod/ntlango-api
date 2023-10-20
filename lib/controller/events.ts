import {Request, Response} from 'express';
import {EventDAO} from '../dao';
import {CreateEventInput, UpdateEventInput, IEvent} from 'ntlango-api-client';
import {InvalidArgumentException, HttpStatusCode} from '../utils';
import slugify from 'slugify';

class EventController {
    static async createEvent(req: Request, res: Response, next: any) {
        try {
            const requestBody: CreateEventInput = req.body;
            const eventData: IEvent = {
                ...requestBody,
                _id: slugify(requestBody.title),
            };

            const createdEvent = await EventDAO.create(eventData);
            res.status(HttpStatusCode.CREATED).json(createdEvent);
        } catch (error) {
            next(error);
        }
    }

    static async getEventById(req: Request, res: Response, next: any) {
        try {
            const {eventId} = req.params;
            const projections = req.query.projections ? (req.query.projections as string).split(',') : [];
            const event = await EventDAO.readEventById(eventId, projections);
            res.status(HttpStatusCode.OK).json(event);
        } catch (error) {
            next(error);
        }
    }

    static async getEvents(req: any, res: Response, next: any) {
        try {
            const {projections, ...parsedQueryParams} = req.parsedQueryParams;
            const events = await EventDAO.readEvents(parsedQueryParams, projections);
            res.status(HttpStatusCode.OK).json(events);
        } catch (error) {
            next(error);
        }
    }

    static async updateEvent(req: Request, res: Response, next: any) {
        try {
            const {eventId} = req.params;
            const eventData: UpdateEventInput = req.body;
            const updatedEvent = await EventDAO.updateEvent(eventId, eventData);
            res.status(HttpStatusCode.OK).json(updatedEvent);
        } catch (error) {
            next(error);
        }
    }

    static async deleteEvent(req: Request, res: Response, next: any) {
        try {
            const {eventId} = req.params;
            const deletedEvent = await EventDAO.deleteEvent(eventId);
            res.status(HttpStatusCode.OK).json(deletedEvent);
        } catch (error) {
            next(error);
        }
    }

    static async rsvpToEvent(req: Request, res: Response, next: any) {
        try {
            if (!req.query.userIds) {
                throw InvalidArgumentException('Invalid user IDs entered');
            }
            const userIds = (req.query.userIds as string).split(',');
            const {eventId} = req.params;
            const event = await EventDAO.rsvp(eventId, userIds);
            res.status(HttpStatusCode.OK).json(event);
        } catch (error) {
            next(error);
        }
    }

    static async cancelRsvpToEvent(req: Request, res: Response, next: any) {
        try {
            if (!req.query.userIds) {
                throw InvalidArgumentException('Invalid user IDs entered');
            }
            const {eventId} = req.params;
            const userIds = (req.query.userIds as string).split(',');
            const event = await EventDAO.cancelRsvp(eventId, userIds);
            res.status(HttpStatusCode.OK).json(event);
        } catch (error) {
            next(error);
        }
    }
}

export default EventController;
