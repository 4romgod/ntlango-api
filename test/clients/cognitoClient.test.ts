import chai from 'chai';
import {createSandbox} from 'sinon';
const {expect} = chai;
import {CognitoClient} from '../../lib/clients';
import {
    SignUpCommand,
    AuthenticationResultType,
    InvalidParameterException,
    NotAuthorizedException,
    InitiateAuthCommand,
    UserNotConfirmedException,
    UserNotFoundException,
    GlobalSignOutCommand,
    UpdateUserAttributesCommand,
    GetUserCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    CodeMismatchException,
    ExpiredCodeException,
    DeleteUserCommand,
    ResendConfirmationCodeCommand,
    AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {RegisterInput} from '@ntlango/api-client';

describe('CognitoClient', () => {
    const sandbox = createSandbox();
    let cognitoIdpMock: any;
    let cognitoClient: CognitoClient;

    const mockAuthResult: AuthenticationResultType = {
        AccessToken: 'mockedAccessToken',
        RefreshToken: 'mockedRefreshToken',
        IdToken: 'mockedIdToken',
        ExpiresIn: 3600,
        TokenType: 'Bearer',
    };

    const registerInput: RegisterInput = {
        address: '123 Main St',
        birthdate: '1990-01-01',
        email: 'user@example.com',
        family_name: 'Doe',
        gender: 'male',
        given_name: 'John',
        password: 'P@ssw0rd',
        phone_number: '+1234567890',
    };

    const updateUserParams = {
        accessToken: 'mockAccessToken',
        attributes: [
            {Name: 'mockName1', Value: 'mockValue1'},
            {Name: 'mockName2', Value: 'mockValue2'},
        ],
    };

    beforeEach(() => {
        cognitoIdpMock = {
            send: sandbox.stub(),
        };
        cognitoClient = new CognitoClient(cognitoIdpMock);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('register', () => {
        it('registers a user when cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(SignUpCommand)).resolves({
                UserSub: 'mockedUserSub',
            });
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            const result = await cognitoClient.register(registerInput);
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({
                message: 'Successfully registered, confirm user',
                userSub: 'mockedUserSub',
            });
        });

        it('throws invalid argument exception when user enters bad input', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(SignUpCommand))
                .throws(new InvalidParameterException({message: 'Invalid Param entered', $metadata: {}}));

            try {
                await cognitoClient.register(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Invalid Param entered');
            }
        });

        it('throws not authorized exception when user is not authorized', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(SignUpCommand))
                .throws(new NotAuthorizedException({message: 'Not AuthNd', $metadata: {}}));

            try {
                await cognitoClient.register(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not AuthNd');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(SignUpCommand)).throws(new Error('some error'));

            try {
                await cognitoClient.register(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('some error');
            }
        });
    });

    describe('login', () => {
        it('login a user when cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).resolves({
                AuthenticationResult: mockAuthResult,
            });
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            const result = await cognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({
                accessToken: 'mockedAccessToken',
                refreshToken: 'mockedRefreshToken',
                idToken: 'mockedIdToken',
                expiresIn: 3600,
                tokenType: 'Bearer',
            });
        });

        it('throws internal service error exception when authentication result are empty', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).resolves({
                AuthenticationResult: undefined,
            });

            try {
                await cognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Authentication result missing');
            }
        });

        it('throws invalid argument exception when user is not confirmed', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(InitiateAuthCommand))
                .throws(new UserNotConfirmedException({message: 'Not confirmed', $metadata: {}}));

            try {
                await cognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledTwice(cognitoIdpMock.send); // Also calls resendVerificationEmail
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Not confirmed');
            }
        });

        it('throws unauthorized exception when cognito throws NotAuthorizedException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(InitiateAuthCommand))
                .throws(new NotAuthorizedException({message: 'Not AuthZ', $metadata: {}}));

            try {
                await cognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not AuthZ');
            }
        });

        it('throws resource not found exception when user does not exist', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(InitiateAuthCommand))
                .throws(new UserNotFoundException({message: 'Not Found', $metadata: {}}));

            try {
                await cognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).throws(new Error('some error'));

            try {
                await cognitoClient.login(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('some error');
            }
        });
    });

    describe('logout', () => {
        it('logout a user when cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(GlobalSignOutCommand)).resolves({});
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            const result = await cognitoClient.logout({accessToken: 'mockToken'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({
                message: 'Successfully logged out',
            });
        });

        it('throws internal service error exception for all cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(GlobalSignOutCommand)).throws(new Error('some error'));

            try {
                await cognitoClient.logout({accessToken: 'mockToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('some error');
            }
        });
    });

    describe('updateUserAttributes', () => {
        it('updates a user when cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand)).resolves({});
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(GetUserCommand)).resolves({
                UserAttributes: updateUserParams.attributes,
            });

            const cognitoClient = new CognitoClient(cognitoIdpMock);

            const result = await cognitoClient.updateUserAttributes(updateUserParams);
            sandbox.assert.calledTwice(cognitoIdpMock.send);
            expect(result).to.deep.equal({
                mockName1: 'mockValue1',
                mockName2: 'mockValue2',
            });
        });

        it('throws invalid argument exception when Cognito call throws InvalidParameterException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand))
                .throws(new InvalidParameterException({message: 'Invalid Param entered', $metadata: {}}));

            try {
                await cognitoClient.updateUserAttributes(updateUserParams);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Invalid Param entered');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await cognitoClient.updateUserAttributes(updateUserParams);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await cognitoClient.updateUserAttributes(updateUserParams);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand)).throws(new Error('Some other error'));
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            try {
                await cognitoClient.updateUserAttributes(updateUserParams);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('forgotPassword', () => {
        it('succeeds when cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(ForgotPasswordCommand)).resolves({});

            const cognitoClient = new CognitoClient(cognitoIdpMock);
            const result = await cognitoClient.forgotPassword({email: 'test@example.com'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({message: 'Successfully called forgot password'});
        });

        it('throws invalid argument exception when Cognito call throws InvalidParameterException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ForgotPasswordCommand))
                .throws(new InvalidParameterException({message: 'Invalid Parameter', $metadata: {}}));
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            try {
                await cognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Invalid Parameter');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ForgotPasswordCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            try {
                await cognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ForgotPasswordCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            try {
                await cognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(ForgotPasswordCommand)).throws(new Error('Some other error'));
            const cognitoClient = new CognitoClient(cognitoIdpMock);

            try {
                await cognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('confirmForgotPassword', () => {
        it('succeeds when Cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand)).resolves({});

            const cognitoClient = new CognitoClient(cognitoIdpMock);
            const result = await cognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({message: 'Successfully confirmed update password'});
        });

        it('throws invalid argument exception when Cognito call throws CodeMismatchException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new CodeMismatchException({message: 'Code Mismatch', $metadata: {}}));

            try {
                const cognitoClient = new CognitoClient(cognitoIdpMock);
                await cognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Code Mismatch');
            }
        });

        it('throws invalid argument exception when Cognito call throws ExpiredCodeException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new ExpiredCodeException({message: 'Expired Code', $metadata: {}}));

            try {
                const cognitoClient = new CognitoClient(cognitoIdpMock);
                await cognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Expired Code');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                const cognitoClient = new CognitoClient(cognitoIdpMock);
                await cognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws resource not found exception when Cognito call throws UserNotFoundException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                const cognitoClient = new CognitoClient(cognitoIdpMock);
                await cognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand)).throws(new Error('Some other error'));

            try {
                const cognitoClient = new CognitoClient(cognitoIdpMock);
                await cognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('removeAccount', () => {
        it('removes the account successfully when Cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(DeleteUserCommand)).resolves({});

            const result = await cognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({message: 'Successfully removed account'});
        });

        it('throws invalid argument exception when Cognito call throws CodeMismatchException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new CodeMismatchException({message: 'Code Mismatch', $metadata: {}}));

            try {
                await cognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Code Mismatch');
            }
        });

        it('throws expired code exception when Cognito call throws ExpiredCodeException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new ExpiredCodeException({message: 'Expired Code', $metadata: {}}));

            try {
                await cognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Expired Code');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await cognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await cognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other Cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(DeleteUserCommand)).throws(new Error('Some other error'));

            try {
                await cognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('adminRemoveAccount', () => {
        it('removes the account successfully when Cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand)).resolves({});

            const result = await cognitoClient.adminRemoveAccount({username: 'mockedUsername'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
            expect(result).to.deep.equal({message: 'Successfully removed account'});
        });

        it('throws invalid argument exception when Cognito call throws CodeMismatchException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new CodeMismatchException({message: 'Code Mismatch', $metadata: {}}));

            try {
                await cognitoClient.adminRemoveAccount({username: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Code Mismatch');
            }
        });

        it('throws expired code exception when Cognito call throws ExpiredCodeException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new ExpiredCodeException({message: 'Expired Code', $metadata: {}}));

            try {
                await cognitoClient.adminRemoveAccount({username: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Expired Code');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await cognitoClient.adminRemoveAccount({username: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await cognitoClient.adminRemoveAccount({username: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other Cognito errors', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand)).throws(new Error('Some other error'));

            try {
                await cognitoClient.adminRemoveAccount({username: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(cognitoIdpMock.send);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('resendVerificationEmail', () => {
        it('sends a verification email successfully when Cognito call succeeds', async () => {
            cognitoIdpMock.send.withArgs(sandbox.match.instanceOf(ResendConfirmationCodeCommand)).resolves({});

            await cognitoClient.resendVerificationEmail({email: 'mockedEmail'});
            sandbox.assert.calledOnce(cognitoIdpMock.send);
        });

        it('logs the error to the console when Cognito call throws InvalidParameterException', async () => {
            const consoleErrorStub = sandbox.stub(console, 'error');
            cognitoIdpMock.send
                .withArgs(sandbox.match.instanceOf(ResendConfirmationCodeCommand))
                .throws(new InvalidParameterException({message: 'Invalid Param', $metadata: {}}));

            await cognitoClient.resendVerificationEmail({email: 'mockedEmail'});

            sandbox.assert.calledOnce(cognitoIdpMock.send);
            sandbox.assert.calledOnce(consoleErrorStub);
            expect(consoleErrorStub.calledWith('Error while sending verification email'));
            consoleErrorStub.restore();
        });
    });
});
