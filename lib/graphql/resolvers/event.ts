import {EventDAO} from '../../dao';

// TODO find types for the resolver params
class EventResolver {
    static Query = {
        event: (parent, {eventId}, context, resolveInfo) => {
            return EventDAO.readEventById(eventId);
        },
        events: (parent, args, context, resolveInfo) => EventDAO.readEvents(),
    };
}

export default EventResolver;
