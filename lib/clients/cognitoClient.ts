import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    InitiateAuthCommand,
    GlobalSignOutCommand,
    UpdateUserAttributesCommand,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommand,
    AdminDeleteUserCommand,
    ResendConfirmationCodeCommand,
    InvalidParameterException,
    NotAuthorizedException,
    InitiateAuthCommandInput,
    SignUpRequest,
    GetUserCommand,
    UpdateUserAttributesCommandInput,
    DeleteUserCommand,
    UserNotConfirmedException,
    UserNotFoundException,
    CodeMismatchException,
    ExpiredCodeException,
} from '@aws-sdk/client-cognito-identity-provider';
import {InternalServiceErrorException, InvalidArgumentException, ResourceNotFoundException, UnauthorizedException} from '../utils/exceptions';
import {COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID} from '../utils/constants';
import {RegisterInput, LoginInput, ForgotPasswordInput, ConfirmForgotPasswordInput} from '@ntlango/api-client'; //TODO install @ntlango/client rather using npm links

export interface IUserToken {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresIn?: number;
    tokenType?: string;
}

class CognitoClient {
    public cognitoIsp: CognitoIdentityProviderClient;

    constructor(cognitoIsp: CognitoIdentityProviderClient) {
        console.log('Initializing Cognito Client...');
        this.cognitoIsp = cognitoIsp;
    }

    public async register(user: RegisterInput): Promise<{message: string; userSub: string}> {
        const {address, birthdate, email, family_name, gender, given_name, password, phone_number} = user;

        const params: SignUpRequest = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            Username: email,
            Password: password,
            UserAttributes: [
                {Name: 'address', Value: address},
                {Name: 'birthdate', Value: birthdate},
                {Name: 'email', Value: email},
                {Name: 'family_name', Value: family_name},
                {Name: 'gender', Value: gender},
                {Name: 'given_name', Value: given_name},
                {Name: 'password', Value: password},
                {Name: 'phone_number', Value: phone_number},
            ],
        };
        try {
            const {UserSub} = await this.cognitoIsp.send(new SignUpCommand(params));
            return {
                userSub: UserSub!,
                message: 'Successfully registered, confirm user',
            };
        } catch (error: any) {
            console.error('Error while registering', error);
            if (error instanceof InvalidParameterException) {
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async login(input: LoginInput): Promise<IUserToken> {
        const {email, password} = input;

        const params: InitiateAuthCommandInput = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        };
        try {
            const cognitoRes = await this.cognitoIsp.send(new InitiateAuthCommand(params));
            const authResult = cognitoRes.AuthenticationResult;
            if (!authResult) {
                // TODO this might have to change, pass user to another
                throw InternalServiceErrorException('Authentication result missing');
            }
            return {
                accessToken: authResult.AccessToken,
                refreshToken: authResult.RefreshToken,
                idToken: authResult.IdToken,
                expiresIn: authResult.ExpiresIn,
                tokenType: authResult.TokenType,
            };
        } catch (error: any) {
            console.error('Error while logging in', error);
            if (error instanceof UserNotConfirmedException) {
                await this.resendVerificationEmail({email});
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            } else if (error instanceof UserNotFoundException) {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async logout({accessToken}: {accessToken: string}): Promise<{message: string}> {
        try {
            const params = {AccessToken: accessToken};
            await this.cognitoIsp.send(new GlobalSignOutCommand(params));
            return {
                message: 'Successfully logged out',
            };
        } catch (error: any) {
            console.error('Error while logging out', error);
            throw InternalServiceErrorException(error.message);
        }
    }

    public async updateUserAttributes({accessToken, attributes}: {accessToken: string; attributes: {Name: string; Value: string}[]}): Promise<any> {
        try {
            const updateParams: UpdateUserAttributesCommandInput = {
                AccessToken: accessToken,
                UserAttributes: attributes,
            };
            await this.cognitoIsp.send(new UpdateUserAttributesCommand(updateParams));

            const cognitoRes = await this.cognitoIsp.send(new GetUserCommand({AccessToken: accessToken}));

            return cognitoRes.UserAttributes?.reduce((result, curr) => {
                result[curr.Name!] = curr.Value;
                return result;
            }, {});
        } catch (error: any) {
            console.error('Error while updating user attributes', error);
            if (error instanceof InvalidParameterException) {
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            } else if (error instanceof UserNotFoundException) {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async forgotPassword(input: ForgotPasswordInput): Promise<{message: string}> {
        const params = {
            ClientId: COGNITO_CLIENT_ID,
            Username: input.email,
        };
        try {
            await this.cognitoIsp.send(new ForgotPasswordCommand(params));
            return {message: 'Successfully called forgot password'};
        } catch (error: any) {
            console.error('Error while calling forgotPassword', error);
            if (error instanceof InvalidParameterException) {
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            } else if (error instanceof UserNotFoundException) {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async confirmForgotPassword(input: ConfirmForgotPasswordInput): Promise<{message: string}> {
        const {email, password, code} = input;

        const params = {
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
            Password: password,
            ConfirmationCode: code,
        };
        try {
            await this.cognitoIsp.send(new ConfirmForgotPasswordCommand(params));
            return {message: 'Successfully confirmed update password'};
        } catch (error: any) {
            console.error('Error while calling confirmForgotPassword', error);
            if (error instanceof CodeMismatchException || error instanceof ExpiredCodeException) {
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            } else if (error instanceof UserNotFoundException) {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async removeAccount({accessToken}: {accessToken: string}): Promise<{message: string}> {
        const params = {
            AccessToken: accessToken,
        };
        try {
            await this.cognitoIsp.send(new DeleteUserCommand(params));
            return {message: 'Successfully removed account'};
        } catch (error: any) {
            console.error('Error while calling deleteUser', error);
            if (error instanceof CodeMismatchException || error instanceof ExpiredCodeException) {
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            } else if (error instanceof UserNotFoundException) {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async adminRemoveAccount({username}: {username: string}): Promise<{message: string}> {
        const params = {
            UserPoolId: COGNITO_USER_POOL_ID,
            Username: username,
        };
        try {
            await this.cognitoIsp.send(new AdminDeleteUserCommand(params));
            return {message: 'Successfully removed account'};
        } catch (error: any) {
            console.error('Error while calling adminDeleteUser', error);
            if (error instanceof CodeMismatchException || error instanceof ExpiredCodeException) {
                throw InvalidArgumentException(error.message);
            } else if (error instanceof NotAuthorizedException) {
                throw UnauthorizedException(error.message);
            } else if (error instanceof UserNotFoundException) {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException(error.message);
        }
    }

    public async resendVerificationEmail({email}: {email: string}): Promise<void> {
        const params = {
            ClientId: COGNITO_CLIENT_ID,
            Username: email,
        };
        try {
            await this.cognitoIsp.send(new ResendConfirmationCodeCommand(params));
        } catch (error: any) {
            console.error('Error while sending verification email', error);
        }
    }
}

export default CognitoClient;
