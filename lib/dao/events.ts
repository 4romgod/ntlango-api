import Event, {IEvent} from '../models/event';

class EventDAO {
    async createEvent(eventData: IEvent): Promise<IEvent> {
        return Event.create(eventData);
    }

    async readEventById(eventId: string, projections?: string[]): Promise<IEvent | null> {
        const query = Event.findById(eventId);
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        return query.exec();
    }

    async readEventBySlug(slug: string, projections?: string[]): Promise<IEvent | null> {
        const query = Event.findOne({slug: slug});
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        return query.exec();
    }

    async readEvents(projections?: string[]): Promise<IEvent[] | null> {
        const query = Event.find({});
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        return query.exec();
    }

    async queryEvents(queryParams: any, projections?: string[]): Promise<IEvent[]> {
        const query = Event.find(queryParams);
        if (projections && projections.length) {
            query.select(projections.join(' '));
        }
        return query.exec();
    }
}

export default EventDAO;
