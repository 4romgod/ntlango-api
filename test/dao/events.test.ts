import {expect} from 'chai';
import sinon, {SinonStub} from 'sinon';
import {EventDAO} from '../../lib/dao';
import {EventStatus, IEvent} from '../../lib/models';
import {Schema} from 'mongoose';

describe('EventDAO', () => {
    let eventDAO: EventDAO;
    let mockEventModel: Record<string, SinonStub>;
    let mockCreateEventInput: IEvent;

    beforeEach(() => {
        mockEventModel = {
            create: sinon.stub(),
            findById: sinon.stub(),
            findOne: sinon.stub(),
            find: sinon.stub(),
        };
        eventDAO = new EventDAO();
        mockCreateEventInput = {
            _id: new Schema.Types.ObjectId('mockPath'),
            title: 'mockTitle',
            description: 'mockDescription',
            status: EventStatus.Completed,
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create an event', async () => {
        // mockEventModel.create.resolves(mockCreateEventInput);
        // const result = await eventDAO.createEvent(mockCreateEventInput);
        // expect(mockEventModel.create.calledOnceWith(mockCreateEventInput)).to.be.true;
        // expect(result).to.deep.equal({...mockCreateEventInput});
    });
});
