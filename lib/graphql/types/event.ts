import {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} from 'graphql';

const EventPrivacySettingType = new GraphQLObjectType({
    name: 'EventPrivacySettingType',
    fields: {
        id: {type: GraphQLID},
        name: {type: GraphQLString},
    },
});

const EventStatusType = new GraphQLObjectType({
    name: 'EventStatusType',
    fields: {
        id: {type: GraphQLID},
        name: {type: GraphQLString},
    },
});

const EventCategoryType = new GraphQLObjectType({
    name: 'EventCategoryType',
    fields: {
        id: {type: GraphQLID},
        name: {type: GraphQLString},
    },
});

const EventTypeType = new GraphQLObjectType({
    name: 'EventTypeType',
    fields: {
        id: {type: GraphQLID},
        name: {type: GraphQLString},
    },
});

const EventType = new GraphQLObjectType({
    name: 'Event',
    fields: {
        _id: {type: new GraphQLNonNull(GraphQLID)},
        title: {type: new GraphQLNonNull(GraphQLString)},
        description: {type: new GraphQLNonNull(GraphQLString)},
        startDate: {type: GraphQLString},
        endDate: {type: GraphQLString},
        location: {type: GraphQLString},
        organizers: {type: new GraphQLList(GraphQLString)},
        eventType: {type: EventTypeType},
        eventCategory: {type: EventCategoryType},
        capacity: {type: GraphQLInt},
        rSVPs: {type: new GraphQLList(GraphQLID)},
        eventLink: {type: GraphQLString},
        status: {type: EventStatusType},
        // TODO tags: { type: new GraphQLObjectType({ name: 'TagsType', fields: {} }) },
        // TODO media: { type: GraphQLFieldMap },
        // TODO additionalDetails: { type: new GraphQLObjectType({ name: 'AdditionalDetailsType', fields: {} }) },
        // TODO comments: { type: new GraphQLObjectType({ name: 'CommentsType', fields: {} }) },
        privacySetting: {type: EventPrivacySettingType},
    },
});

export default EventType;
