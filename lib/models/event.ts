import {model, Schema} from 'mongoose';

/**
 * @description The general nature or purpose of an event. They categorize events based on their fundamental characteristics and the kind of experience they offer to participants.
 * @examples Parties, conferences, workshops, sports events, concerts, networking events.
 * @purpose Event types provide a high-level description of what participants can expect from an event. They help users quickly identify the overall format and purpose of an event.
 */
export enum EventType {
    Concert = 'Concert',
    Conference = 'Conference',
    Networking = 'Networking',
    Party = 'Party',
    Sport = 'Sport',
    Workshop = 'Workshop',
    Other = 'Other',
}

/**
 * @definition More specific themes or topics that events can be associated with. They delve deeper into the subject matter or focus of an event, irrespective of the event's format.
 * @examples Arts, music, technology, health and wellness, food and drink, travel.
 * @purpose Event categories allow users to explore events based on their personal interests or passions. Users interested in a particular category can discover various types of events that fall under that theme.
 */
export enum EventCategory {
    Arts = 'Arts',
    Music = 'Music',
    Technology = 'Technology',
    Health = 'Health',
    FoodAndDrink = 'FoodAndDrink',
    Travel = 'Travel',
    Other = 'Other',
}

/**
 * @description The current status of the event
 * @examples upcoming, ongoing, completed, cancelled
 */
export enum EventStatus {
    Cancelled = 'Cancelled',
    Completed = 'Completed',
    Ongoing = 'Ongoing',
    Upcoming = 'Upcoming',
}

/**
 * @description Determine whether the event is public, private, or accessible by invitation only.
 * @examples public, private, invitation
 */
export enum PrivacySetting {
    Public = 'Public',
    Private = 'Private',
    Invitation = 'Invitation',
}

/**
 * @description A space for users to engage in discussions or leave comments related to the event.
 * @example comment = {ebay: "This is a comment"}
 */
export type Comments = Map<string, string>;

/**
 * @description Any other relevant information, such as ticket pricing, agenda, special guests, etc.
 * @example detail = {ticketPrice: 25}
 */
export type Details = Map<string, any>;

/**
 * @description Visual assets that represent the event, such as banners or promotional images.
 */
export type Media = Map<string, any>;

export interface IEvent {
    _id?: Schema.Types.ObjectId;
    slug?: string;
    title: string;
    description: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    organizers?: Array<Schema.Types.ObjectId>; // Information about the individuals or organizations hosting the event.
    eventType?: EventType;
    eventCategory?: EventCategory;
    capacity?: number;
    rSVPs?: Array<Schema.Types.ObjectId>;
    tags?: Map<string, any>;
    eventLink?: string; // A link to the event's website or registration page.
    status: EventStatus;
    media?: Media;
    additionalDetails?: Details;
    comments?: Comments;
    privacySetting?: PrivacySetting;
}

const EventSchema = new Schema<IEvent>(
    {
        _id: {type: Schema.Types.ObjectId, required: false},
        slug: {type: String},
        title: {type: String, required: true},
        description: {type: String, required: true},
        startDate: {type: String},
        endDate: {type: String},
        location: String,
        organizers: {type: [Schema.Types.ObjectId]},
        eventType: {type: String, required: false},
        eventCategory: {type: String, required: false},
        capacity: {type: Number, required: false},
        rSVPs: {type: [Schema.Types.ObjectId], required: false},
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
