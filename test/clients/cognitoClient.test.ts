import {expect} from 'chai';
import {SinonStub, createSandbox} from 'sinon';
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
import {UserLoginInput, UserRegisterInput, UserUpdateInput} from 'ntlango-api-client';
import {CognitoIdentityProviderClient} from '@aws-sdk/client-cognito-identity-provider';
import {convertUpdateUserToUserAttributes} from '../../lib/utils';

describe('CognitoClient', () => {
    const sandbox = createSandbox();
    let sendStub: SinonStub;

    const mockAuthResult: AuthenticationResultType = {
        AccessToken: 'mockedAccessToken',
        RefreshToken: 'mockedRefreshToken',
        IdToken: 'mockedIdToken',
        ExpiresIn: 3600,
        TokenType: 'Bearer',
    };

    const registerInput: UserRegisterInput = {
        userID: 'mockUserId',
        address: '123 Main St',
        birthdate: '1990-01-01',
        email: 'user@example.com',
        family_name: 'Doe',
        gender: 'male',
        given_name: 'John',
        password: 'P@ssw0rd',
        phone_number: '+1234567890',
    };

    const loginInput: UserLoginInput = {
        email: 'mockEmail',
        password: 'mockPassword',
    };

    const updateUserInput: UserUpdateInput = {
        address: 'mockAddress',
        email: 'mockEmail',
        family_name: 'mockFamilyName',
    };

    beforeEach(() => {
        CognitoClient.initialize();
        sendStub = sandbox.stub(CognitoIdentityProviderClient.prototype, 'send');
    });

    describe('register', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('registers a user when cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(SignUpCommand)).resolves({
                UserSub: 'mockedUserSub',
            });

            const result = await CognitoClient.register(registerInput);
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({
                message: 'Successfully registered, confirm user',
                userSub: 'mockedUserSub',
            });
        });

        it('throws invalid argument exception when user enters bad input', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(SignUpCommand))
                .throws(new InvalidParameterException({message: 'Invalid Param entered', $metadata: {}}));

            try {
                await CognitoClient.register(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                expect(sendStub.calledOnce).to.be.true;
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Invalid Param entered');
            }
        });

        it('throws not authorized exception when user is not authorized', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(SignUpCommand)).throws(new NotAuthorizedException({message: 'Not AuthNd', $metadata: {}}));

            try {
                await CognitoClient.register(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not AuthNd');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(SignUpCommand)).throws(new Error('some error'));

            try {
                await CognitoClient.register(registerInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('some error');
            }
        });
    });

    describe('login', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('login a user when cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).resolves({
                AuthenticationResult: mockAuthResult,
            });

            const result = await CognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({
                accessToken: 'mockedAccessToken',
                refreshToken: 'mockedRefreshToken',
                idToken: 'mockedIdToken',
                expiresIn: 3600,
                tokenType: 'Bearer',
            });
        });

        it('throws internal service error exception when authentication result are empty', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).resolves({
                AuthenticationResult: undefined,
            });

            try {
                await CognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Authentication result missing');
            }
        });

        it('throws invalid argument exception when user is not confirmed', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(InitiateAuthCommand))
                .throws(new UserNotConfirmedException({message: 'Not confirmed', $metadata: {}}));

            try {
                await CognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledTwice(sendStub); // Also calls resendVerificationEmail
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Not confirmed');
            }
        });

        it('throws unauthorized exception when cognito throws NotAuthorizedException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(InitiateAuthCommand))
                .throws(new NotAuthorizedException({message: 'Not AuthZ', $metadata: {}}));

            try {
                await CognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not AuthZ');
            }
        });

        it('throws resource not found exception when user does not exist', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).throws(new UserNotFoundException({message: 'Not Found', $metadata: {}}));

            try {
                await CognitoClient.login({email: 'mockEmail', password: 'mockPassword'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(InitiateAuthCommand)).throws(new Error('some error'));

            try {
                await CognitoClient.login(loginInput);
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('some error');
            }
        });
    });

    describe('logout', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('logout a user when cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(GlobalSignOutCommand)).resolves({});

            const result = await CognitoClient.logout({accessToken: 'mockToken'});
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({
                message: 'Successfully logged out',
            });
        });

        it('throws internal service error exception for all cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(GlobalSignOutCommand)).throws(new Error('some error'));

            try {
                await CognitoClient.logout({accessToken: 'mockToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('some error');
            }
        });
    });

    describe('updateUserAttributes', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('updates a user when cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand)).resolves({});
            sendStub.withArgs(sandbox.match.instanceOf(GetUserCommand)).resolves({
                UserAttributes: convertUpdateUserToUserAttributes(updateUserInput),
            });

            const result = await CognitoClient.updateUserAttributes({accessToken: 'mockAccessToken', updateInput: updateUserInput});
            sandbox.assert.calledTwice(sendStub);
            expect(result).to.deep.equal({
                address: 'mockAddress',
                email: 'mockEmail',
                family_name: 'mockFamilyName',
            });
        });

        it('throws invalid argument exception when Cognito call throws InvalidParameterException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand))
                .throws(new InvalidParameterException({message: 'Invalid Param entered', $metadata: {}}));

            try {
                await CognitoClient.updateUserAttributes({accessToken: 'mockAccessToken', updateInput: updateUserInput});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Invalid Param entered');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await CognitoClient.updateUserAttributes({accessToken: 'mockAccessToken', updateInput: updateUserInput});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await CognitoClient.updateUserAttributes({accessToken: 'mockAccessToken', updateInput: updateUserInput});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(UpdateUserAttributesCommand)).throws(new Error('Some other error'));

            try {
                await CognitoClient.updateUserAttributes({accessToken: 'mockAccessToken', updateInput: updateUserInput});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('forgotPassword', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('succeeds when cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(ForgotPasswordCommand)).resolves({});

            const result = await CognitoClient.forgotPassword({email: 'test@example.com'});
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({message: 'Successfully called forgot password'});
        });

        it('throws invalid argument exception when Cognito call throws InvalidParameterException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ForgotPasswordCommand))
                .throws(new InvalidParameterException({message: 'Invalid Parameter', $metadata: {}}));

            try {
                await CognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Invalid Parameter');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ForgotPasswordCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await CognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ForgotPasswordCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await CognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(ForgotPasswordCommand)).throws(new Error('Some other error'));

            try {
                await CognitoClient.forgotPassword({email: 'test@example.com'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('confirmForgotPassword', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('succeeds when Cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand)).resolves({});

            const result = await CognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({message: 'Successfully confirmed update password'});
        });

        it('throws invalid argument exception when Cognito call throws CodeMismatchException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new CodeMismatchException({message: 'Code Mismatch', $metadata: {}}));

            try {
                await CognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Code Mismatch');
            }
        });

        it('throws invalid argument exception when Cognito call throws ExpiredCodeException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new ExpiredCodeException({message: 'Expired Code', $metadata: {}}));

            try {
                await CognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Expired Code');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await CognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws resource not found exception when Cognito call throws UserNotFoundException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await CognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(ConfirmForgotPasswordCommand)).throws(new Error('Some other error'));

            try {
                await CognitoClient.confirmForgotPassword({email: 'mockEmail', password: 'mockPass', code: 'mockCode'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('removeAccount', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('removes the account successfully when Cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(DeleteUserCommand)).resolves({});

            const result = await CognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({message: 'Successfully removed account'});
        });

        it('throws invalid argument exception when Cognito call throws CodeMismatchException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new CodeMismatchException({message: 'Code Mismatch', $metadata: {}}));

            try {
                await CognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Code Mismatch');
            }
        });

        it('throws expired code exception when Cognito call throws ExpiredCodeException', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(DeleteUserCommand)).throws(new ExpiredCodeException({message: 'Expired Code', $metadata: {}}));

            try {
                await CognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Expired Code');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await CognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(DeleteUserCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await CognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other Cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(DeleteUserCommand)).throws(new Error('Some other error'));

            try {
                await CognitoClient.removeAccount({accessToken: 'mockedAccessToken'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('adminRemoveAccount', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('removes the account successfully when Cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand)).resolves({});

            const result = await CognitoClient.adminRemoveAccount({userId: 'mockedUsername'});
            sandbox.assert.calledOnce(sendStub);
            expect(result).to.deep.equal({message: 'Successfully removed account'});
        });

        it('throws invalid argument exception when Cognito call throws CodeMismatchException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new CodeMismatchException({message: 'Code Mismatch', $metadata: {}}));

            try {
                await CognitoClient.adminRemoveAccount({userId: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Code Mismatch');
            }
        });

        it('throws expired code exception when Cognito call throws ExpiredCodeException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new ExpiredCodeException({message: 'Expired Code', $metadata: {}}));

            try {
                await CognitoClient.adminRemoveAccount({userId: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(400);
                expect(error.message).to.equal('Expired Code');
            }
        });

        it('throws not authorized exception when Cognito call throws NotAuthorizedException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new NotAuthorizedException({message: 'Not Authorized', $metadata: {}}));

            try {
                await CognitoClient.adminRemoveAccount({userId: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(403);
                expect(error.message).to.equal('Not Authorized');
            }
        });

        it('throws user not found exception when Cognito call throws UserNotFoundException', async () => {
            sendStub
                .withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand))
                .throws(new UserNotFoundException({message: 'User Not Found', $metadata: {}}));

            try {
                await CognitoClient.adminRemoveAccount({userId: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(404);
                expect(error.message).to.equal('User Not Found');
            }
        });

        it('throws internal service error exception for all other Cognito errors', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(AdminDeleteUserCommand)).throws(new Error('Some other error'));

            try {
                await CognitoClient.adminRemoveAccount({userId: 'mockedUsername'});
                expect.fail('Expected an exception to be thrown');
            } catch (error: any) {
                sandbox.assert.calledOnce(sendStub);
                expect(error.statusCode).to.equal(500);
                expect(error.message).to.equal('Some other error');
            }
        });
    });

    describe('resendVerificationEmail', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('sends a verification email successfully when Cognito call succeeds', async () => {
            sendStub.withArgs(sandbox.match.instanceOf(ResendConfirmationCodeCommand)).resolves({});

            await CognitoClient.resendVerificationEmail({email: 'mockedEmail'});
            sandbox.assert.calledOnce(sendStub);
        });

        it('logs the error to the console when Cognito call throws InvalidParameterException', async () => {
            const consoleErrorStub = sandbox.stub(console, 'error');
            sendStub
                .withArgs(sandbox.match.instanceOf(ResendConfirmationCodeCommand))
                .throws(new InvalidParameterException({message: 'Invalid Param', $metadata: {}}));

            await CognitoClient.resendVerificationEmail({email: 'mockedEmail'});

            sandbox.assert.calledOnce(sendStub);
            sandbox.assert.calledOnce(consoleErrorStub);
            expect(consoleErrorStub.calledWith('Error while sending verification email'));
            consoleErrorStub.restore();
        });
    });
});
