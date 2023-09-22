import {expect} from 'chai';
import {createSandbox, SinonSandbox, SinonSpy} from 'sinon';
import {profileRouter} from '../../lib/router';

describe('Profile Routes', () => {
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

    it('should define the /profile (put) route', () => {
        expect(profileRouter.stack.some((layer: any) => layer.route?.path === '/profile')).to.be.true;

        const route = profileRouter.stack.find((layer: any) => layer.route?.path === '/profile');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'updateProfile')).to.be.true;
        expect(route.route.methods.put).to.be.true;
    });

    it('should define the /profile/forgotPassword (put) route', () => {
        expect(profileRouter.stack.some((layer: any) => layer.route?.path === '/profile/forgotPassword')).to.be.true;

        const route = profileRouter.stack.find((layer: any) => layer.route?.path === '/profile/forgotPassword');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'forgotPassword')).to.be.true;
        expect(route.route.methods.put).to.be.true;
    });

    it('should define the /profile/forgotPassword/confirm (put) route', () => {
        expect(profileRouter.stack.some((layer: any) => layer.route?.path === '/profile/forgotPassword/confirm')).to.be.true;

        const route = profileRouter.stack.find((layer: any) => layer.route?.path === '/profile/forgotPassword/confirm');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'confirmForgotPassword')).to.be.true;
        expect(route.route.methods.put).to.be.true;
    });

    it('should define the /profile/remove (delete) route', () => {
        expect(profileRouter.stack.some((layer: any) => layer.route?.path === '/profile/remove')).to.be.true;

        const route = profileRouter.stack.find((layer: any) => layer.route?.path === '/profile/remove');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'removeProfile')).to.be.true;
        expect(route.route.methods.delete).to.be.true;
    });

    it('should define the /profile/remove/:userId (delete) route', () => {
        expect(profileRouter.stack.some((layer: any) => layer.route?.path === '/profile/remove/:userId')).to.be.true;

        const route = profileRouter.stack.find((layer: any) => layer.route?.path === '/profile/remove/:userId');

        expect(route.route.stack.some((middleware: any) => middleware.name === 'isInputValid')).to.be.true;
        expect(route.route.stack.some((middleware: any) => middleware.name === 'adminRemoveProfile')).to.be.true;
        expect(route.route.methods.delete).to.be.true;
    });
});
