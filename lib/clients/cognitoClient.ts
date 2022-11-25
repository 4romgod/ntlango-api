import CognitoIdentityServiceProvider, {
    InitiateAuthRequest,
    SignUpRequest,
    ResendConfirmationCodeRequest,
    UpdateUserAttributesRequest,
    ForgotPasswordRequest,
    ConfirmForgotPasswordRequest,
    DeleteUserRequest,
    AdminDeleteUserRequest,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {
    InternalServiceErrorException,
    InvalidArgumentException,
    ResourceNotFoundException,
    UnauthenticatedException,
    UnauthorizedException,
} from '../utils/exceptions';
import {AWS_REGION, COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID} from '../config';
import {RegisterInput, LoginInput, ForgotPasswordInput, ConfirmForgotPasswordInput} from '@ntlango/client'; //TODO install @ntlango/client rather using npm links
import {TIMEOUT_MILLI, NUMBER_OF_RETRIES, CONNECTION_TIMEOUT_MILLI} from '../utils/constants';

export interface IUserToken {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
    tokenType: string;
}

class CognitoClient {
    public cognitoIsp: CognitoIdentityServiceProvider;

    constructor() {
        this.cognitoIsp = new CognitoIdentityServiceProvider({
            region: AWS_REGION,
            maxRetries: NUMBER_OF_RETRIES,
            retryDelayOptions: {
                base: 150,
            },
            httpOptions: {
                connectTimeout: CONNECTION_TIMEOUT_MILLI,
                timeout: TIMEOUT_MILLI,
            },
        });
    }

    public async register(user: RegisterInput): Promise<{message: string}> {
        const {email, address, gender, given_name, family_name, birthdate, password} = user;

        const params: SignUpRequest = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            Username: email,
            Password: password,
            UserAttributes: [
                {Name: 'email', Value: email},
                {Name: 'given_name', Value: given_name},
                {Name: 'family_name', Value: family_name},
                {Name: 'birthdate', Value: birthdate},
                {Name: 'gender', Value: gender},
                {Name: 'address', Value: address},
            ],
        };
        try {
            await this.cognitoIsp.signUp(params).promise();
            return {message: 'Successfully registered, confirm user'};  // TODO update function to return the new user
        } catch (error: any) {
            console.error('Error while registering', error);
            if (error.statusCode === 400) {
                throw InvalidArgumentException(error.message);
            } else if (error.statusCode === 401) {
                throw UnauthenticatedException(error.message);
            } else if (error.statusCode === 403) {
                throw UnauthorizedException(error.message);
            }
            throw InternalServiceErrorException('Failed to register');
        }
    }

    public async login(input: LoginInput): Promise<IUserToken> {
        const {email, password} = input;

        const params: InitiateAuthRequest = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            },
        };
        try {
            const cognitoRes = await this.cognitoIsp.initiateAuth(params).promise();
            return {
                accessToken: cognitoRes.AuthenticationResult?.AccessToken || '',
                refreshToken: cognitoRes.AuthenticationResult?.RefreshToken || '',
                idToken: cognitoRes.AuthenticationResult?.IdToken || '',
                expiresIn: cognitoRes.AuthenticationResult?.ExpiresIn || 0,
                tokenType: cognitoRes.AuthenticationResult?.TokenType || '',
            };
        } catch (error: any) {
            console.error('Error while logging in', error);
            if (error.code === 'UserNotConfirmedException') {
                await this.resendVerificationEmail({email});
                throw InvalidArgumentException('Confirm your email before logging in');
            } else if (error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'UserNotFoundException') {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException('Failed to login');
        }
    }

    public async updateUserAttributes({accessToken, attributes}: {accessToken: string; attributes: {Name: string; Value: string}[]}): Promise<any> {
        const params: UpdateUserAttributesRequest = {
            AccessToken: accessToken,
            UserAttributes: attributes,
        };
        try {
            await this.cognitoIsp.updateUserAttributes(params).promise();
            const cognitoRes = await this.cognitoIsp.getUser({AccessToken: accessToken}).promise();
            const user = cognitoRes.UserAttributes.reduce((result, curr) => {
                result[curr.Name] = curr.Value;
                return result;
            }, {});
            return user;
        } catch (error: any) {
            console.error('Error while updating user attributes', error);
            if (error.code === 'UnexpectedParameter' || error.code === 'InvalidParameterException' || error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'UserNotFoundException') {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException('Failed to update user attributes');
        }
    }

    public async forgotPassword(input: ForgotPasswordInput): Promise<{message: string}> {
        const params: ForgotPasswordRequest = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            Username: input.email,
        };
        try {
            await this.cognitoIsp.forgotPassword(params).promise();
            return {message: 'Successfully called forgot password'};
        } catch (error: any) {
            console.error('Error while calling forgotPassword', error);
            if (error.code === 'UnexpectedParameter' || error.code === 'InvalidParameterException' || error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'UserNotFoundException') {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException('Error while calling forgotPassword');
        }
    }

    public async confirmForgotPassword(input: ConfirmForgotPasswordInput): Promise<{message: string}> {
        const {email, password, code} = input;

        const params: ConfirmForgotPasswordRequest = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            Username: email,
            Password: password,
            ConfirmationCode: code,
        };
        try {
            await this.cognitoIsp.confirmForgotPassword(params).promise();
            return {message: 'Successfully confirmed update password'};
        } catch (error: any) {
            console.error('Error while calling confirmForgotPassword', error);
            if (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException' || error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'UserNotFoundException') {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException('Error while calling confirmForgotPassword');
        }
    }

    public async removeAccount({accessToken}: {accessToken: string}): Promise<{message: string}> {
        const params: DeleteUserRequest = {
            AccessToken: accessToken,
        };
        try {
            await this.cognitoIsp.deleteUser(params).promise();
            return {message: 'Successfully removed account'};
        } catch (error: any) {
            console.error('Error while calling deleteUser', error);
            if (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException' || error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'UserNotFoundException') {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException('Error while calling deleteAccount');
        }
    }

    public async adminRemoveAccount({username}: {username: string}): Promise<{message: string}> {
        const params: AdminDeleteUserRequest = {
            UserPoolId: `${COGNITO_USER_POOL_ID}`,
            Username: username,
        };
        try {
            await this.cognitoIsp.adminDeleteUser(params).promise();
            return {message: 'Successfully removed account'};
        } catch (error: any) {
            console.error('Error while calling adminDeleteUser', error);
            if (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException' || error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'UserNotFoundException') {
                throw ResourceNotFoundException(error.message);
            }
            throw InternalServiceErrorException('Error while calling deleteAccount');
        }
    }

    public async resendVerificationEmail({email}: {email: string}): Promise<void> {
        const params: ResendConfirmationCodeRequest = {
            ClientId: `${COGNITO_CLIENT_ID}`,
            Username: email,
        };
        try {
            await this.cognitoIsp.resendConfirmationCode(params).promise();
        } catch (error: any) {
            console.error('Error while sending verification email', error);
        }
    }
}

export default CognitoClient;
