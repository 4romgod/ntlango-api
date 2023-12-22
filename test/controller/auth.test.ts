import {expect} from 'chai';
import {AuthController} from '../../lib/controller';
import {HttpStatusCode} from '../../lib/utils';
import {SinonSpy, SinonStub, createSandbox} from 'sinon';
import {CognitoClient} from '../../lib/clients';
import UserDAO from '../../lib/dao/user';

describe('AuthController', () => {
    const sandbox = createSandbox();
    let req: any, res: any, next: SinonSpy;
    let registerStub: SinonStub;
    let loginStub: SinonStub;
    let logoutStub: SinonStub;

    let createUserStub: SinonStub;

    const mockeUser = {
        _id: 'mockUser',
        address: '120 Kloof street, Cape Town, 8001',
        birthdate: '1994-06-26',
        email: 'ebenezermathebula@gmail.com',
        family_name: 'Mathebula',
        gender: 'male',
        given_name: 'Ebenezer',
        password: 'Gue$$730',
        phone_number: '+27670153779',
        preferredUsername: 'ebay',
    };

    beforeEach(() => {
        registerStub = sandbox.stub(CognitoClient, 'register');
        loginStub = sandbox.stub(CognitoClient, 'login');
        logoutStub = sandbox.stub(CognitoClient, 'logout');

        createUserStub = sandbox.stub(UserDAO, 'create');

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
            createUserStub.resolves(mockeUser);

            await AuthController.register(req, res, next);

            expect(registerStub.calledOnce).to.be.true;
            // TODO expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            // TODO expect(res.json.calledOnceWith(mockeUser)).to.be.true;
            // TODO expect(next.called).to.be.false;
        });

        it('should handle registration error', async () => {
            registerStub.rejects(new Error('Registration error'));

            await AuthController.register(req, res, next);

            expect(registerStub.calledOnce).to.be.true;
            // TODO expect(next.calledOnce).to.be.true;
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
