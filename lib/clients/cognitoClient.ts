import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {
    ConfirmSignUpRequest,
    InitiateAuthRequest,
    SignUpRequest,
    ResendConfirmationCodeRequest,
    UpdateUserAttributesRequest,
    ForgotPasswordRequest,
    ConfirmForgotPasswordRequest,
} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {InternalServiceErrorException, InvalidArgumentException} from '../utils/exceptions';
import 'dotenv/config';

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
        this.cognitoIsp = new CognitoIdentityServiceProvider({region: process.env.AWS_REGION});
    }

    public async signUp({email, address, gender, given_name, family_name, birthdate, password}): Promise<boolean> {
        const params: SignUpRequest = {
            ClientId: process.env.COGNITO_CLIENT_ID || '',
            Username: email,
            Password: password,
            UserAttributes: [
                {Name: 'email', Value: email},
                {Name: 'address', Value: address},
                {Name: 'gender', Value: gender},
                {Name: 'given_name', Value: given_name},
                {Name: 'family_name', Value: family_name},
                {Name: 'birthdate', Value: birthdate},
            ],
        };
        try {
            const cognitoRes = await this.cognitoIsp.signUp(params).promise();
            return cognitoRes.UserConfirmed;
        } catch (error: any) {
            console.error('Error while signing up', error);
            if (error.code === 'UsernameExistsException') {
                throw InvalidArgumentException(error.message);
            }
            throw InternalServiceErrorException('Failed to signup a new user');
        }
    }

    public async confirmSignUp({email, code}: {email: string; code: string}): Promise<void> {
        const params: ConfirmSignUpRequest = {
            ClientId: `${process.env.COGNITO_CLIENT_ID}`,
            Username: email,
            ConfirmationCode: code,
        };
        try {
            await this.cognitoIsp.confirmSignUp(params).promise();
        } catch (error: any) {
            console.error('Error while confirming signup', error);
            if (error.code === 'CodeMismatchException') {
                throw InvalidArgumentException(error.message);
            } else if (error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            }
            throw InternalServiceErrorException('Failed to confirm signup for new user');
        }
    }

    public async signIn({email, password}: {email: string; password: string}): Promise<IUserToken> {
        const params: InitiateAuthRequest = {
            ClientId: `${process.env.COGNITO_CLIENT_ID}`,
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
            console.error('Error while signing in', error);
            if (error.code === 'UserNotConfirmedException') {
                await this.resendConfirmation({email});
                throw InvalidArgumentException('Confirm your email before signing in');
            } else if (error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            }
            throw InternalServiceErrorException('Failed to signin an existing user');
        }
    }

    public async updateUserAttributes({accessToken, attributes}: {accessToken: string; attributes: {Name: string; Value: string}[]}): Promise<void> {
        const params: UpdateUserAttributesRequest = {
            AccessToken: accessToken,
            UserAttributes: attributes,
        };
        try {
            await this.cognitoIsp.updateUserAttributes(params).promise();
        } catch (error: any) {
            console.error('Error while updating user attributes', error);
            console.error('Error while confirming signup', error);
            if (error.code === 'UnexpectedParameter' || error.code === 'InvalidParameterException') {
                throw InvalidArgumentException(error.message);
            }
            throw InternalServiceErrorException('Failed to update user attributes');
        }
    }

    public async forgotPassword({email}: {email: string}): Promise<void> {
        const params: ForgotPasswordRequest = {
            ClientId: `${process.env.COGNITO_CLIENT_ID}`,
            Username: email,
        };
        try {
            await this.cognitoIsp.forgotPassword(params).promise();
        } catch (error: any) {
            console.error('Error while calling forgotPassword', error);
            throw InternalServiceErrorException('Error while calling forgotPassword');
        }
    }

    public async confirmForgotPassword({email, password, code}: {email: string, password: string, code: string}): Promise<void> {
        const params: ConfirmForgotPasswordRequest = {
            ClientId: `${process.env.COGNITO_CLIENT_ID}`,
            Username: email,
            Password: password,
            ConfirmationCode: code,
        };
        try {
            await this.cognitoIsp.confirmForgotPassword(params).promise();
        } catch (error: any) {
            console.error('Error while calling confirmForgotPassword', error);
            if (error.code === 'CodeMismatchException' || error.code === 'ExpiredCodeException' || error.code === 'NotAuthorizedException') {
                throw InvalidArgumentException(error.message);
            }
            throw InternalServiceErrorException('Error while calling confirmForgotPassword');
        }
    }

    public async resendConfirmation({email}: {email: string}): Promise<void> {
        const params: ResendConfirmationCodeRequest = {
            ClientId: `${process.env.COGNITO_CLIENT_ID}`,
            Username: email,
        };
        try {
            await this.cognitoIsp.resendConfirmationCode(params).promise();
        } catch (error: any) {
            console.error('Error while resending confirmation', error);
        }
    }
}

export default new CognitoClient();
