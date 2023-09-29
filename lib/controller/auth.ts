import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils';
import {CognitoClient} from '../clients';
import {LoginInput, RegisterInput} from '@ntlango/api-client';

class AuthController {
    private static cognitoClient: CognitoClient;

    static initialize(reinitialize = false) {
        if (!this.cognitoClient || reinitialize) {
            CognitoClient.initialize();
        }
    }

    static async register(req: Request, res: Response, next: any) {
        const registerInput: RegisterInput = req.body;
        try {
            const cognitoRes = await CognitoClient.register(registerInput);
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: any) {
        try {
            const loginInput: LoginInput = req.body;
            const cognitoRes = await CognitoClient.login(loginInput);
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async logout(req: Request, res: Response, next: any) {
        try {
            // TODO use the actual access token
            await CognitoClient.logout({accessToken: ''});
            return res.status(HttpStatusCode.OK).json({
                message: 'Successfully logged out',
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default AuthController;
