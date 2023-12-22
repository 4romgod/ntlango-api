import {GraphQLObjectType, GraphQLString, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull} from 'graphql';

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        _id: {type: new GraphQLNonNull(GraphQLID)},
        userID: {type: new GraphQLNonNull(GraphQLID)},
        address: {type: GraphQLString},
        birthdate: {type: GraphQLString},
        email: {type: GraphQLString},
        family_name: {type: GraphQLString},
        gender: {type: GraphQLString},
        given_name: {type: GraphQLString},
        password: {type: GraphQLString},
        phone_number: {type: GraphQLString},
        preferred_username: {type: GraphQLString},
        profile_picture: {type: GraphQLString},
        website: {type: GraphQLString},
    },
});

export default UserType;
