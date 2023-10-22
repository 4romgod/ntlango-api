import {GraphQLObjectType, GraphQLID, GraphQLList} from 'graphql';
import {EventType} from '../types';
import {EventResolver} from '../resolvers';

const QueryType = new GraphQLObjectType({
    name: 'EventQuery',
    fields: {
        event: {
            type: EventType,
            args: {
                eventId: {type: GraphQLID},
            },
            resolve: EventResolver.Query.event,
        },
        events: {
            type: new GraphQLList(EventType),
            resolve: EventResolver.Query.events,
        },
    },
});

export const EventSchema = {
    QueryType,
    types: [EventType],
};
