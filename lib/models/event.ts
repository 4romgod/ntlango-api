import {CreateEventInput} from '@ntlango/api-client';
import {model, Schema} from 'mongoose';

export type IEvent = CreateEventInput & {
    _id: string;
};

const EventSchema = new Schema<IEvent>(
    {
        _id: {type: String, required: true},
        title: {type: String, required: true},
        description: {type: String, required: false},
        startDate: {type: String},
        endDate: {type: String},
        location: String,
        organizers: {type: [String]},
        eventType: {type: String, required: false},
        eventCategory: {type: String, required: false},
        capacity: {type: Number, required: false},
        rSVPs: {type: [String], required: false},
        tags: {type: Map, of: String, required: false},
        eventLink: {type: String, required: false},
        status: {type: String, required: false},
        media: {type: Map, of: Schema.Types.Mixed, required: false},
        additionalDetails: {type: Map, of: Schema.Types.Mixed, required: false},
        comments: {type: Map, of: String, required: false},
        privacySetting: {type: String, required: false},
    },
    {timestamps: true},
);

const Event = model<IEvent>('events', EventSchema);

export default Event;
