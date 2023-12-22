import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils';
import {CognitoClient} from '../clients';
import {UserLoginInput, UserRegisterInput} from 'ntlango-api-client';
import UserDAO from '../dao/user';

class AuthController {
    private static cognitoClient: CognitoClient;

    static initialize(reinitialize = false) {
        if (!this.cognitoClient || reinitialize) {
            CognitoClient.initialize();
        }
    }

    static async register(req: Request, res: Response, next: any) {
        const registerInput: UserRegisterInput = req.body;

        let cognitoRes: {message: string; userSub: string} = {message: '', userSub: ''};

        try {
            cognitoRes = await CognitoClient.register(registerInput);
        } catch (error: any) {
            next(error);
        }

        try {
            if (!registerInput.userID) {
                registerInput.userID = cognitoRes.userSub;
            }

            const mongodbRes = await UserDAO.create(registerInput);

            return res.status(HttpStatusCode.OK).json(mongodbRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async confirmRegistration(req: Request, res: Response, next: any) {
        const {email, confirmationCode} = req.body;
        try {
            await CognitoClient.confirmSignUp(email, confirmationCode);
            return res.status(HttpStatusCode.OK).json({
                message: 'User registration confirmed successfully',
            });
        } catch (error: any) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: any) {
        try {
            const loginInput: UserLoginInput = req.body;
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
