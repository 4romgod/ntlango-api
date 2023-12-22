import {IUser} from 'ntlango-api-client';
import {model, Schema} from 'mongoose';

const UserSchema = new Schema<IUser>(
    {
        userID: {type: String, required: true, unique: true},
        address: {type: String, required: true},
        birthdate: {type: String, required: true},
        email: {type: String, required: true},
        family_name: {type: String, required: true},
        gender: {type: String, required: false},
        given_name: {type: String, required: true},
        password: {type: String, required: false},
        phone_number: {type: String, required: false},
        preferred_username: {type: String, required: false},
        profile_picture: {type: String, required: false},
        website: {type: String, required: false},
    },
    {timestamps: true},
);

const User = model<IUser>('users', UserSchema);

export default User;
