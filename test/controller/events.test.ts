import {expect} from 'chai';
import sinon, {SinonStub} from 'sinon';
import {EventController} from '../../lib/controller';
import {HttpStatusCode} from '../../lib/utils/constants';
import {EventStatus, IEvent} from '../../lib/models';

describe('EventController', () => {
    let eventController: EventController;
    let mockEventDAO: Record<string, SinonStub>;
    let req: any;
    let res: any;
    let mockEvent: IEvent;

    beforeEach(() => {
        mockEventDAO = {
            createEvent: sinon.stub(),
            readEventById: sinon.stub(),
            readEventBySlug: sinon.stub(),
            readEvents: sinon.stub(),
            queryEvents: sinon.stub(),
        };
        eventController = new EventController(mockEventDAO as any);

        req = {
            body: {},
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub(),
        };
        mockEvent = {
            slug: 'mockSlug',
            title: 'mockTitle',
            description: 'mockDescription',
            status: EventStatus.Completed,
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create an event', async () => {
        mockEventDAO.createEvent.resolves(mockEvent);
        req.body = mockEvent;

        await eventController.createEvent(req, res);

        expect(mockEventDAO.createEvent.calledOnce).to.be.true;
        expect(res.status.calledOnceWith(HttpStatusCode.CREATED)).to.be.true;
        expect(res.json.calledOnceWith(mockEvent)).to.be.true;
    });
});
