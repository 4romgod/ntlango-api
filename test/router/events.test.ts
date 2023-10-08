import {expect} from 'chai';
import {createSandbox, SinonSandbox, SinonSpy} from 'sinon';
import {eventsRouter} from '../../lib/router';

describe('Events Routes', () => {
    let sandbox: SinonSandbox;
    let req: any, res: any, next: SinonSpy;

    before(() => {
        sandbox = createSandbox();

        req = {};
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
        next = sandbox.spy();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should define the /events (post) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events')).to.be.true;
        const route = eventsRouter.stack.find((layer: any) => layer.route?.path === '/events' && layer.route.methods.post === true);
        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'createEvent')).to.be.true;
    });

    it('should define the /events (get) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events')).to.be.true;
        const route = eventsRouter.stack.find((layer: any) => layer.route?.path === '/events' && layer.route.methods.get === true);
        expect(route.route.stack.some((middleware: any) => middleware.name === 'getEvents')).to.be.true;
    });

    it('should define the /events/:eventId (get) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events/:eventId')).to.be.true;
        const route = eventsRouter.stack.find((layer: any) => layer.route?.path === '/events/:eventId' && layer.route.methods.get === true);
        expect(route.route.stack.some((middleware: any) => middleware.name === 'getEventById')).to.be.true;
    });

    it('should define the /events/:eventId (put) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events/:eventId')).to.be.true;
        const route = eventsRouter.stack.find((layer: any) => layer.route?.path === '/events/:eventId' && layer.route.methods.put === true);
        expect(route.route.stack.some((middleware: any) => middleware.name === 'updateEvent')).to.be.true;
    });

    it('should define the /events/:eventId (delete) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events/:eventId')).to.be.true;
        const route = eventsRouter.stack.find((layer: any) => layer.route?.path === '/events/:eventId' && layer.route.methods.delete === true);
        expect(route.route.stack.some((middleware: any) => middleware.name === 'deleteEvent')).to.be.true;
    });

    it('should define the /events/:eventId/rsvp (post) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events/:eventId/rsvp')).to.be.true;
        const route = eventsRouter.stack.find((layer: any) => layer.route?.path === '/events/:eventId/rsvp' && layer.route.methods.put === true);
        expect(route.route.stack.some((middleware: any) => middleware.name === 'rsvpToEvent')).to.be.true;
    });

    it('should define the /events/:eventId/cancelrsvp (post) route', () => {
        expect(eventsRouter.stack.some((layer: any) => layer.route?.path === '/events/:eventId/cancelrsvp')).to.be.true;
        const route = eventsRouter.stack.find(
            (layer: any) => layer.route?.path === '/events/:eventId/cancelrsvp' && layer.route.methods.put === true,
        );
        expect(route.route.stack.some((middleware: any) => middleware.name === 'cancelRsvpToEvent')).to.be.true;
        expect(route.route.methods.put).to.be.true;
    });
});
