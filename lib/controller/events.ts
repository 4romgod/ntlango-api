import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils/constants';
import {EventDAO} from '../dao';
import {IEvent} from '../models';
import slugify from 'slugify';

class EventController {
    private eventDAO: EventDAO;

    constructor(eventDAO: EventDAO) {
        this.eventDAO = eventDAO;
    }

    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const requestBody = req.body;
            const slug = slugify(requestBody.title);
            const eventData: IEvent = {...requestBody, slug};

            const event = await this.eventDAO.createEvent(eventData);
            res.status(HttpStatusCode.CREATED).json(event);
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }

    async getEventById(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const projections = req.query.projections ? (req.query.projections as string).split(',') : [];
            const event = await this.eventDAO.readEventById(eventId, projections);

            if (event) {
                res.status(HttpStatusCode.OK).json(event);
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json({error: 'Event not found'});
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }

    async getEventBySlug(req: Request, res: Response): Promise<void> {
        try {
            const slug = req.params.slug;
            const projections = req.query.projections ? (req.query.projections as string).split(',') : [];
            const event = await this.eventDAO.readEventBySlug(slug, projections);

            if (event) {
                res.status(HttpStatusCode.OK).json(event);
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json({error: 'Event not found'});
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }

    async getEvents(req: Request, res: Response): Promise<void> {
        try {
            const projections = req.query.projections ? (req.query.projections as string).split(',') : [];
            const events = await this.eventDAO.readEvents(projections);

            if (events && events.length) {
                res.status(HttpStatusCode.OK).json(events);
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json({error: 'Events not found'});
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }

    async queryEvents(req: Request, res: Response): Promise<void> {
        try {
            const queryParams = req.query;
            const projections = req.query.projections ? (req.query.projections as string).split(',') : [];
            const events = await this.eventDAO.queryEvents(queryParams, projections);

            if (events && events.length) {
                res.status(HttpStatusCode.OK).json(events);
            } else {
                res.status(HttpStatusCode.NOT_FOUND).json({error: 'Events not found'});
            }
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({error: 'Internal Server Error'});
        }
    }
}

export default EventController;
