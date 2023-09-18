import {expect} from 'chai';
import {AuthController} from '../../lib/controller';
import {HttpStatusCode} from '../../lib/utils/constants';
import {SinonSpy, SinonStub, createSandbox} from 'sinon';
import { CognitoClient } from '../../lib/clients';

describe('AuthController', () => {
    const sandbox = createSandbox();
    let req: any, res: any, next: SinonSpy;
    let registerStub: SinonStub;
    let loginStub: SinonStub;
    let logoutStub: SinonStub;

    beforeEach(() => {
        registerStub = sandbox.stub(CognitoClient, 'register');
        loginStub = sandbox.stub(CognitoClient, 'login');
        logoutStub = sandbox.stub(CognitoClient, 'logout');

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

    describe('register', () => {
        afterEach(() => {
            sandbox.restore();
        });
    
        it('should register a new user', async () => {
            registerStub.resolves({message: 'User registered'});

            await AuthController.register(req, res, next);

            expect(registerStub.calledOnce).to.be.true;
            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'User registered'})).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle registration error', async () => {
            registerStub.rejects(new Error('Registration error'));

            await AuthController.register(req, res, next);

            expect(registerStub.calledOnce).to.be.true;
            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;
        });
    });

    describe('login', () => {
        afterEach(() => {
            sandbox.restore();
        });
    
        it('should login a user successfully', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const cognitoRes = {};

            loginStub.resolves(cognitoRes);

            req.body = {email, password};

            await AuthController.login(req, res, next);

            expect(loginStub.calledOnceWith({email, password})).to.be.true;
            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith(cognitoRes)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle login error', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const loginError = new Error('Login failed');

            loginStub.rejects(loginError);

            req.body = {email, password};

            await AuthController.login(req, res, next);

            expect(loginStub.calledOnceWith({email, password})).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;
            expect(next.calledOnceWith(loginError)).to.be.true;
        });
    });

    describe('logout', () => {
        afterEach(() => {
            sandbox.restore();
        });
    
        it('should logout a user successfully', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const cognitoRes = {};

            loginStub.resolves(cognitoRes);

            req.body = {email, password};

            await AuthController.login(req, res, next);

            expect(loginStub.calledOnceWith({email, password})).to.be.true;
            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith(cognitoRes)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle login error', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const loginError = new Error('Login failed');

            loginStub.rejects(loginError);

            req.body = {email, password};

            await AuthController.login(req, res, next);

            expect(loginStub.calledOnceWith({email, password})).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;
            expect(next.calledOnceWith(loginError)).to.be.true;
        });
    });

    describe('logout', () => {
        afterEach(() => {
            sandbox.restore();
        });
    
        it('should log out a user', async () => {
            await AuthController.logout(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'Successfully logged out'})).to.be.true;
            expect(next.called).to.be.false;
        });
    });
});
