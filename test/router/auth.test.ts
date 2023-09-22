import {expect} from 'chai';
import {createSandbox, SinonSandbox, SinonSpy} from 'sinon';
import {authRouter} from '../../lib/router';

describe('Auth Routes', () => {
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

    it('should define the /auth/register (post) route', () => {
        expect(authRouter.stack.some((layer: any) => layer.route?.path === '/auth/register')).to.be.true;

        const route = authRouter.stack.find((layer: any) => layer.route?.path === '/auth/register');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'register')).to.be.true;
        expect(route.route.methods.post).to.be.true;
    });

    it('should define the /auth/login (post) route', () => {
        expect(authRouter.stack.some((layer: any) => layer.route?.path === '/auth/login')).to.be.true;

        const route = authRouter.stack.find((layer: any) => layer.route?.path === '/auth/login');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'login')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
    });

    it('should define the /auth/logout (post) route', () => {
        expect(authRouter.stack.some((layer: any) => layer.route?.path === '/auth/logout')).to.be.true;

        const route = authRouter.stack.find((layer: any) => layer.route?.path === '/auth/logout');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'logout')).to.be.true;
    });
});
