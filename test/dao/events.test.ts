import {expect} from 'chai';
import {SinonStub, createSandbox} from 'sinon';
import {EventDAO} from '../../lib/dao';
import {EventStatus, IEvent} from '../../lib/models';
import Event, {UpdateEventInput} from '../../lib/models/event';
import {HttpStatusCode} from '../../lib/utils/constants';

describe('Event DAO', () => {
    const sandbox = createSandbox();
    let sampleEvent: IEvent;
    let createStub: SinonStub;
    let findByIdStub: SinonStub;
    let findStub: SinonStub;
    let findByIdAndUpdateStub: SinonStub;
    let findByIdAndRemoveStub: SinonStub;
    let queryStub: {
        select: SinonStub;
        exec: SinonStub;
    };

    beforeEach(() => {
        sampleEvent = {
            _id: 'sampleEventId',
            title: 'Sample Event',
            description: 'This is a sample event',
            status: EventStatus.Ongoing,
        };
        createStub = sandbox.stub(Event, 'create');
        findByIdStub = sandbox.stub(Event, 'findById');
        findStub = sandbox.stub(Event, 'find');
        findByIdAndUpdateStub = sandbox.stub(Event, 'findByIdAndUpdate');
        findByIdAndRemoveStub = sandbox.stub(Event, 'findByIdAndRemove');
        queryStub = {
            select: sandbox.stub().returnsThis(),
            exec: sandbox.stub(),
        };
    });

    describe('create', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should create a new event', async () => {
            createStub.resolves(sampleEvent);

            const createdEvent = await EventDAO.create(sampleEvent);

            expect(createdEvent).to.deep.equal(sampleEvent);
            expect(createStub.calledOnce).to.be.true;
        });
    });

    describe('readEventById', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should return an event by ID', async () => {
            queryStub.exec.resolves(sampleEvent);
            findByIdStub.withArgs(sampleEvent._id).returns(queryStub);

            const event = await EventDAO.readEventById(sampleEvent._id, ['title', 'description']);

            expect(event).to.deep.equal(sampleEvent);
            expect(findByIdStub.calledOnceWithExactly(sampleEvent._id)).to.be.true;
        });

        it('should throw a 404 error', async () => {
            queryStub.exec.resolves(undefined);
            findByIdStub.withArgs(sampleEvent._id).returns(queryStub);

            try {
                await EventDAO.readEventById(sampleEvent._id);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                expect(error.statusCode).to.equal(HttpStatusCode.NOT_FOUND);
                expect(error.message).to.equal('Event not found');
                expect(error.errorType).to.equal('ResourceNotFoundException');
            }
        });
    });

    describe('readEvents', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should return all events with projections', async () => {
            queryStub.exec.resolves([sampleEvent]);
            findStub.returns(queryStub);

            const events = await EventDAO.readEvents(undefined, ['title', 'description']);

            expect(events).to.deep.equal([sampleEvent]);
            expect(queryStub.select.args[0][0]).to.equal('title description');
            // expect(findStub.args[0][0]).to.equal({}); TODO fix this
        });

        it('should return all events without projections', async () => {
            queryStub.exec.resolves([sampleEvent]);
            findStub.returns(queryStub);

            const events = await EventDAO.readEvents();

            expect(events).to.deep.equal([sampleEvent]);
            expect(findStub.calledOnceWithExactly({})).to.be.true;
            expect(queryStub.select.args.length).to.equal(0);
        });
    });

    describe('updateEvent', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should update an event by ID', async () => {
            const newTitle = 'Updated Title';
            sampleEvent.title = newTitle;
            queryStub.exec.resolves(sampleEvent);
            findByIdAndUpdateStub.returns(queryStub);

            const eventData: UpdateEventInput = {title: newTitle};
            const updatedEvent = await EventDAO.updateEvent(sampleEvent._id, eventData);

            expect(updatedEvent).to.deep.equal(sampleEvent);
            expect(findByIdAndUpdateStub.calledOnceWithExactly(sampleEvent._id, eventData, {new: true})).to.be.true;
        });

        it('should throw a 404 error', async () => {
            queryStub.exec.resolves(undefined);
            findByIdAndUpdateStub.withArgs(sampleEvent._id).returns(queryStub);

            try {
                await EventDAO.updateEvent(sampleEvent._id, {title: 'updated title'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                expect(error.statusCode).to.equal(HttpStatusCode.NOT_FOUND);
                expect(error.message).to.equal('Event not found');
                expect(error.errorType).to.equal('ResourceNotFoundException');
            }
        });
    });

    describe('deleteEvent', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should delete an event by ID', async () => {
            queryStub.exec.resolves(sampleEvent);
            findByIdAndRemoveStub.returns(queryStub);

            const deletedEvent = await EventDAO.deleteEvent(sampleEvent._id);

            expect(deletedEvent).to.deep.equal(sampleEvent);
            expect(findByIdAndRemoveStub.calledOnceWithExactly(sampleEvent._id)).to.be.true;
        });

        it('should throw a 404 error', async () => {
            queryStub.exec.resolves(undefined);
            findByIdAndRemoveStub.withArgs(sampleEvent._id).returns(queryStub);

            try {
                await EventDAO.deleteEvent(sampleEvent._id);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                expect(error.statusCode).to.equal(HttpStatusCode.NOT_FOUND);
                expect(error.message).to.equal('Event not found');
                expect(error.errorType).to.equal('ResourceNotFoundException');
            }
        });
    });

    describe('rsvp', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should add users to the RSVP list', async () => {
            const userIds = ['user1', 'user2'];
            (sampleEvent.rSVPs = userIds), queryStub.exec.resolves(sampleEvent);
            findByIdAndUpdateStub.returns(queryStub);

            const event = await EventDAO.rsvp(sampleEvent._id, userIds);

            expect(event).to.deep.equal(sampleEvent);
            expect(event?.rSVPs).to.equal(userIds);
            expect(findByIdAndUpdateStub.calledOnceWithExactly(sampleEvent._id, {$addToSet: {rSVPs: {$each: userIds}}}, {new: true})).to.be.true;
        });
    });

    describe('cancelRsvp', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should remove users from the RSVP list', async () => {
            queryStub.exec.resolves(sampleEvent);
            findByIdAndUpdateStub.returns(queryStub);

            const userIds = ['user1', 'user2'];
            const event = await EventDAO.cancelRsvp(sampleEvent._id, userIds);

            expect(event).to.deep.equal(sampleEvent);
            expect(event?.rSVPs).to.equal(undefined);
            expect(findByIdAndUpdateStub.calledOnceWithExactly(sampleEvent._id, {$pull: {rSVPs: {$in: userIds}}}, {new: true})).to.be.true;
        });
    });
});
