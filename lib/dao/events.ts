import {EventCreateInput, EventUpdateInput, IEvent} from 'ntlango-api-client';
import {ResourceNotFoundException, mongodbErrorHandler} from '../utils';
import Event from '../models/event';

export type EventQueryParams = Partial<Record<keyof IEvent, any>>;

class EventDAO {
    static async create(eventData: EventCreateInput): Promise<IEvent> {
        try {
            return await Event.create(eventData);
        } catch (error) {
            console.log(error);
            throw mongodbErrorHandler(error);
        }
    }

    static async readEventById(eventID: string, projections?: Array<string>): Promise<IEvent> {
        const query = Event.findById(eventID);
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

    static async updateEvent(eventID: string, eventData: EventUpdateInput) {
        const updatedEvent = await Event.findByIdAndUpdate(eventID, eventData, {new: true}).exec();
        if (!updatedEvent) {
            throw ResourceNotFoundException('Event not found');
        }
        return updatedEvent;
    }

    static async deleteEvent(eventID: string): Promise<IEvent> {
        const deletedEvent = await Event.findByIdAndRemove(eventID).exec();
        if (!deletedEvent) {
            throw ResourceNotFoundException('Event not found');
        }
        return deletedEvent;
    }

    static async rsvp(eventID: string, userIDs: Array<string>) {
        const event = await Event.findByIdAndUpdate(eventID, {$addToSet: {rSVPs: {$each: userIDs}}}, {new: true}).exec();
        return event;
    }

    static async cancelRsvp(eventID: string, userIDs: Array<string>) {
        const event = await Event.findByIdAndUpdate(eventID, {$pull: {rSVPs: {$in: userIDs}}}, {new: true}).exec();
        return event;
    }
}

export default EventDAO;
