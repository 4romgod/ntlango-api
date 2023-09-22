import {expect} from 'chai';
import {createSandbox, SinonSandbox, SinonSpy} from 'sinon';
import {healthCheckRouter} from '../../lib/router';

describe('HealthCheck Routes', () => {
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

    it('should define the /healthcheck (get) route', () => {
        expect(healthCheckRouter.stack.some((layer: any) => layer.route?.path === '/healthcheck')).to.be.true;

        const route = healthCheckRouter.stack.find((layer: any) => layer.route?.path === '/healthcheck');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'healthCheck')).to.be.true;
        expect(route.route.methods.get).to.be.true;
    });
});
