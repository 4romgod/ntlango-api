import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {
    ConfirmSignUpRequest,
    InitiateAuthRequest,
    SignUpRequest,
    ResendConfirmationCodeRequest,
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

    public async signUp({email, password, firstName, lastName}): Promise<boolean> {
        const params: SignUpRequest = {
            ClientId: process.env.COGNITO_CLIENT_ID || '',
            Username: email,
            Password: password,
            UserAttributes: [
                {Name: 'email', Value: email},
                {Name: 'given_name', Value: firstName},
                {Name: 'family_name', Value: lastName},
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
            }
            throw InternalServiceErrorException('Failed to signin an existing user');
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
