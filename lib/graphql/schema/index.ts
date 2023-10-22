import {GraphQLSchema} from 'graphql';
import {EventSchema} from './event';

// TODO mix and use query types from other APIs
export const graphqlSchema = new GraphQLSchema({
    query: EventSchema.QueryType,
});
