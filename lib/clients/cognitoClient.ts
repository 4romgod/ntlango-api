import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {ConfirmSignUpRequest, InitiateAuthRequest, SignUpRequest} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {InternalServiceErrorException, InvalidArgumentException} from '../utils/exceptions';
import 'dotenv/config';

export interface IUserToken {
    accessToken: string;
    refreshToken: string;
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
                throw InvalidArgumentException('Username already exists');
            }
            throw InternalServiceErrorException('Failed to signup a new user');
        }
    }

    public async confirmSignUp({email, code}: {email: string; code: string}): Promise<void> {
        const params: ConfirmSignUpRequest = {
            ClientId: process.env.COGNITO_CLIENT_ID || '',
            Username: email,
            ConfirmationCode: code,
        };
        try {
            await this.cognitoIsp.confirmSignUp(params).promise();
        } catch (error) {
            console.error('Error while confirming signup', error);
            throw InternalServiceErrorException('Failed to confirm signup for new user');
        }
    }

    public async signIn({email, password}: {email: string; password: string}): Promise<IUserToken> {
        const params: InitiateAuthRequest = {
            ClientId: process.env.COGNITO_CLIENT_ID || '',
            AuthFlow: 'ALLOW_USER_PASSWORD_AUTH',
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
            };
        } catch (error) {
            console.error('Error while signing in', error);
            throw InternalServiceErrorException('Failed to signin an existing user');
        }
    }
}

export default new CognitoClient();
