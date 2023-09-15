import {expect} from 'chai';
import {AuthController} from '../../lib/controller';
import {HttpStatusCode} from '../../lib/utils/constants';
import {SinonStub, createSandbox} from 'sinon';

describe('AuthController', () => {
    const sandbox = createSandbox();
    let authController: AuthController;
    let mockCognitoClient: Record<string, SinonStub>;
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
        mockCognitoClient = {
            register: sandbox.stub(),
            login: sandbox.stub(),
            logout: sandbox.stub(),
        };
        authController = new AuthController(mockCognitoClient as any);

        req = {
            body: {},
        };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
        next = sandbox.stub();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('register', () => {
        it('should register a new user', async () => {
            mockCognitoClient.register.resolves({message: 'User registered'});
            await authController.register(req, res, next);

            expect(mockCognitoClient.register.calledOnce).to.be.true;
            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'User registered'})).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle registration error', async () => {
            mockCognitoClient.register.rejects(new Error('Registration error'));
            await authController.register(req, res, next);

            expect(mockCognitoClient.register.calledOnce).to.be.true;
            expect(next.calledOnce).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const cognitoRes = {};

            mockCognitoClient.login.resolves(cognitoRes);

            req.body = {email, password};

            await authController.login(req, res, next);

            expect(mockCognitoClient.login.calledOnceWith({email, password})).to.be.true;
            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith(cognitoRes)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle login error', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const loginError = new Error('Login failed');

            mockCognitoClient.login.rejects(loginError);

            req.body = {email, password};

            await authController.login(req, res, next);

            expect(mockCognitoClient.login.calledOnceWith({email, password})).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;
            expect(next.calledOnceWith(loginError)).to.be.true;
        });
    });

    describe('logout', () => {
        it('should logout a user successfully', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const cognitoRes = {};

            mockCognitoClient.login.resolves(cognitoRes);

            req.body = {email, password};

            await authController.login(req, res, next);

            expect(mockCognitoClient.login.calledOnceWith({email, password})).to.be.true;
            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith(cognitoRes)).to.be.true;
            expect(next.called).to.be.false;
        });

        it('should handle login error', async () => {
            const email = 'test@example.com';
            const password = 'testPassword';
            const loginError = new Error('Login failed');

            mockCognitoClient.login.rejects(loginError);

            req.body = {email, password};

            await authController.login(req, res, next);

            expect(mockCognitoClient.login.calledOnceWith({email, password})).to.be.true;
            expect(res.status.called).to.be.false;
            expect(res.json.called).to.be.false;
            expect(next.calledOnceWith(loginError)).to.be.true;
        });
    });

    describe('logout', () => {
        it('should log out a user', async () => {
            await authController.logout(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'Successfully logged out'})).to.be.true;
            expect(next.called).to.be.false;
        });
    });
});
