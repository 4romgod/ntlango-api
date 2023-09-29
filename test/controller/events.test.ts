import {expect} from 'chai';
import {EventController} from '../../lib/controller';
import {HttpStatusCode} from '../../lib/utils';
import {SinonStub, createSandbox} from 'sinon';
import {EventDAO} from '../../lib/dao';
import {EventStatus} from '../../lib/models';
import slugify from 'slugify';

describe('Event Controller', () => {
    const sandbox = createSandbox();
    let req: any, res: any, next: any;
    let createEventStub: SinonStub;
    let readEventByIdStub: SinonStub;
    let readEventsStub: SinonStub;
    let updateEventStub: SinonStub;
    let deleteEventStub: SinonStub;
    let rsvpStub: SinonStub;
    let cancelRsvpStub: SinonStub;

    beforeEach(() => {
        createEventStub = sandbox.stub(EventDAO, 'create');
        readEventByIdStub = sandbox.stub(EventDAO, 'readEventById');
        readEventsStub = sandbox.stub(EventDAO, 'readEvents');
        updateEventStub = sandbox.stub(EventDAO, 'updateEvent');
        deleteEventStub = sandbox.stub(EventDAO, 'deleteEvent');
        rsvpStub = sandbox.stub(EventDAO, 'rsvp');
        cancelRsvpStub = sandbox.stub(EventDAO, 'cancelRsvp');

        req = {};
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
        next = sandbox.spy();
    });

    describe('createEvent', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should create a new event and return it', async () => {
            req.body = {
                title: 'Sample Event',
                description: 'This is a sample event',
            };
            const _id = slugify(req.body.title);
            const mockResponse = {...req.body, _id};
            createEventStub.resolves(mockResponse);

            await EventController.createEvent(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.CREATED)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(createEventStub.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should handle errors and call next', async () => {
            req.body = {
                title: 'Sample Event',
                description: 'This is a sample event',
            };

            createEventStub.rejects(new Error('Failed to create event'));

            await EventController.createEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Failed to create event');
            expect(createEventStub.calledOnceWithExactly({...req.body, _id: slugify(req.body.title)})).to.be.true;
        });
    });

    describe('getEventById', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should return an event by ID with projections', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {projections: 'title,description'};

            const mockResponse = {_id: eventId, title: 'Sample Event', description: 'Sample desc'};
            readEventByIdStub.resolves(mockResponse);

            await EventController.getEventById(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(readEventByIdStub.calledOnceWithExactly(eventId, ['title', 'description'])).to.be.true;
            expect(readEventByIdStub.args).to.deep.equal([['sampleEventId', ['title', 'description']]]);
            expect(next.notCalled).to.be.true;
        });

        it('should return an event by ID without projections', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {};

            const mockResponse = {_id: eventId, title: 'Sample Event', description: 'Sample desc'};
            readEventByIdStub.resolves(mockResponse);

            await EventController.getEventById(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(readEventByIdStub.calledOnceWithExactly(eventId, [])).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should handle errors and call next', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {projections: 'title,description'};

            readEventByIdStub.rejects(new Error('Event not found'));

            await EventController.getEventById(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Event not found');
            expect(readEventByIdStub.calledOnceWithExactly(eventId, ['title', 'description'])).to.be.true;
        });
    });

    describe('getEvents', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should return matching events when called with projections and query params', async () => {
            req.query = {status: EventStatus.Ongoing, projections: 'title,description'};

            const mockResponse = [{_id: 'eventId', title: 'Sample Event', description: 'Sample desc'}];
            readEventsStub.resolves(mockResponse);

            await EventController.getEvents(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(readEventsStub.calledOnceWithExactly({status: EventStatus.Ongoing}, ['title', 'description'])).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should return matching events when called with projections and without query params', async () => {
            req.query = {projections: 'title,description'};

            const mockResponse = [{_id: 'eventId', title: 'Sample Event', description: 'Sample desc'}];
            readEventsStub.resolves(mockResponse);

            await EventController.getEvents(req, res, next);

            expect(res.status.calledWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(readEventsStub.calledOnceWithExactly({}, ['title', 'description'])).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should return matching events with query params and without projections', async () => {
            req.query = {status: EventStatus.Ongoing};

            const mockResponse = [{_id: 'eventId', title: 'Sample Event'}];
            readEventsStub.resolves(mockResponse);

            await EventController.getEvents(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(readEventsStub.calledOnceWithExactly({status: EventStatus.Ongoing}, [])).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should return matching events without both projections and query params', async () => {
            req.query = {};

            const mockResponse = [{_id: 'eventId', title: 'Sample Event'}];
            readEventsStub.resolves(mockResponse);

            await EventController.getEvents(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse)).to.be.true;
            expect(readEventsStub.calledOnceWithExactly({}, [])).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should handle errors and call next', async () => {
            req.query = {status: EventStatus.Ongoing, projections: 'title,description'};

            readEventsStub.rejects(new Error('Failed to fetch events'));

            await EventController.getEvents(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Failed to fetch events');
            expect(readEventsStub.calledOnceWithExactly({status: EventStatus.Ongoing}, ['title', 'description'])).to.be.true;
        });
    });

    describe('updateEvent', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should update an event and return it', async () => {
            req.body = {title: 'Updated Title'};
            const eventId = slugify(req.body.title);
            req.params = {eventId};

            const mockResponse = {_id: eventId, title: 'Updated Title'};
            updateEventStub.resolves(mockResponse);

            await EventController.updateEvent(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse));
            expect(updateEventStub.calledOnceWithExactly(eventId, {title: 'Updated Title'})).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should handle errors and call next', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.body = {title: 'Updated Title'};

            updateEventStub.rejects(new Error('Event not found'));

            await EventController.updateEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Event not found');
            expect(updateEventStub.calledOnceWithExactly(eventId, {title: 'Updated Title'})).to.be.true;
        });
    });

    describe('deleteEvent', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should delete an event and return it', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};

            const mockResponse = {_id: eventId, title: 'Sample Event'};
            deleteEventStub.resolves(mockResponse);

            await EventController.deleteEvent(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse));
            expect(deleteEventStub.calledOnceWithExactly(eventId)).to.be.true;
            expect(next.notCalled).to.be.true;
        });

        it('should handle errors and call next', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};

            deleteEventStub.rejects(new Error('Event not found'));

            await EventController.deleteEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Event not found');
            expect(deleteEventStub.calledOnceWithExactly(eventId)).to.be.true;
        });
    });

    describe('rsvpToEvent', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should add users to the RSVP list and return the updated event', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {userIds: 'user1,user2'};

            const mockResponse = {_id: eventId, rSVPs: ['user1', 'user2']};
            rsvpStub.resolves(mockResponse);

            await EventController.rsvpToEvent(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse));
            expect(rsvpStub.calledOnceWithExactly(eventId, ['user1', 'user2'])).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            expect(next.notCalled).to.be.true;
            expect(rsvpStub.calledWith(eventId, ['user1', 'user2']));
        });

        it('should handle errors and call next', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {userIds: 'user1,user2'};

            rsvpStub.rejects(new Error('Failed to RSVP'));

            await EventController.rsvpToEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Failed to RSVP');
            expect(rsvpStub.calledOnceWithExactly(eventId, ['user1', 'user2'])).to.be.true;
        });

        it('should handle errors and call next when called without user ids', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {userIds: undefined};

            await EventController.rsvpToEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Invalid user IDs entered');
        });
    });

    describe('cancelRsvpToEvent', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should remove users from the RSVP list and return the updated event', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {userIds: 'user1,user2'};

            const mockResponse = {_id: eventId, rSVPs: []};
            cancelRsvpStub.resolves(mockResponse);

            await EventController.cancelRsvpToEvent(req, res, next);

            expect(res.status.calledOnceWithExactly(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWithExactly(mockResponse));
            expect(cancelRsvpStub.calledOnceWithExactly(eventId, ['user1', 'user2']));
            expect(next.notCalled).to.be.true;
        });

        it('should handle errors and call next', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {userIds: 'user1,user2'};

            cancelRsvpStub.rejects(new Error('Failed to cancel RSVP'));

            await EventController.cancelRsvpToEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Failed to cancel RSVP');
            expect(cancelRsvpStub.calledWith(eventId, ['user1', 'user2']));
        });

        it('should handle errors and call next when called without user ids', async () => {
            const eventId = 'sampleEventId';
            req.params = {eventId};
            req.query = {userIds: undefined};

            await EventController.cancelRsvpToEvent(req, res, next);

            expect(next.calledOnce).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Invalid user IDs entered');
        });
    });
});
