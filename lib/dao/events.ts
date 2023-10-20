import {UpdateEventInput, IEvent} from 'ntlango-api-client';
import {ResourceNotFoundException, mongodbErrorHandler} from '../utils';
import Event from '../models/event';

export type EventQueryParams = Partial<Record<keyof IEvent, any>>;

class EventDAO {
    static async create(eventData: IEvent): Promise<IEvent> {
        try {
            return await Event.create(eventData);
        } catch (error) {
            console.log(error);
            throw mongodbErrorHandler(error);
        }
    }

    static async readEventById(eventId: string, projections?: Array<string>): Promise<IEvent> {
        const query = Event.findById(eventId);
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        const event = await query.exec();

        if (!event) {
            throw ResourceNotFoundException('Event not found');
        }
        return event;
    }

    static async readEvents(queryParams?: EventQueryParams, projections?: Array<string>): Promise<Array<IEvent>> {
        const query = Event.find({...queryParams});
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        return await query.exec();
    }

    static async updateEvent(eventId: string, eventData: UpdateEventInput) {
        const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, {new: true}).exec();
        if (!updatedEvent) {
            throw ResourceNotFoundException('Event not found');
        }
        return updatedEvent;
    }

    static async deleteEvent(eventId: string): Promise<IEvent> {
        const deletedEvent = await Event.findByIdAndRemove(eventId).exec();
        if (!deletedEvent) {
            throw ResourceNotFoundException('Event not found');
        }
        return deletedEvent;
    }

    static async rsvp(eventId: string, userIds: Array<string>) {
        const event = await Event.findByIdAndUpdate(eventId, {$addToSet: {rSVPs: {$each: userIds}}}, {new: true}).exec();
        return event;
    }

    static async cancelRsvp(eventId: string, userIds: Array<string>) {
        const event = await Event.findByIdAndUpdate(eventId, {$pull: {rSVPs: {$in: userIds}}}, {new: true}).exec();
        return event;
    }
}

export default EventDAO;
