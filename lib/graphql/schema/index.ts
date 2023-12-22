import {GraphQLObjectType, GraphQLID, GraphQLList, GraphQLSchema} from 'graphql';
import {EventType, UserType} from '../types';
import {EventDAO, UserDAO} from '../../dao';

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        event: {
            type: EventType,
            args: {
                eventID: {type: GraphQLID},
            },
            resolve(parent, {eventID}, context, resolveInfo) {
                return EventDAO.readEventById(eventID);
            },
        },
        events: {
            type: new GraphQLList(EventType),
            resolve(parent, args, context, resolveInfo) {
                return EventDAO.readEvents();
            },
        },
        user: {
            type: UserType,
            args: {
                userID: {type: GraphQLID},
            },
            resolve(parent, {userID}, context, resolveInfo) {
                return UserDAO.readUserById(userID);
            },
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args, context, resolveInfo) {
                return UserDAO.readUsers();
            },
        },
    },
});

export default new GraphQLSchema({
    query: RootQuery,
});
