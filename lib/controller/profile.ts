import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils';
import {CognitoClient} from '../clients';
import {ConfirmForgotPasswordInput, UpdateUserInput} from '@ntlango/api-client';

class ProfileController {
    private static cognitoClient: CognitoClient;

    static initialize(reinitialize = false) {
        if (!this.cognitoClient || reinitialize) {
            CognitoClient.initialize();
        }
    }

    static async updateProfile(req: Request, res: Response, next: any) {
        try {
            const updateInput: UpdateUserInput = req.body;
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await CognitoClient.updateUserAttributes({accessToken, updateInput});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async forgotPassword(req: Request, res: Response, next: any) {
        try {
            const {email} = req.body;
            const cognitoRes = await CognitoClient.forgotPassword({email});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async confirmForgotPassword(req: Request, res: Response, next: any) {
        try {
            const confirmForgotPasswordInput: ConfirmForgotPasswordInput = req.body;
            const cognitoRes = await CognitoClient.confirmForgotPassword(confirmForgotPasswordInput);
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async removeProfile(req: Request, res: Response, next: any) {
        try {
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await CognitoClient.removeAccount({accessToken});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    static async adminRemoveProfile(req: Request, res: Response, next: any) {
        try {
            const {userId} = req.params;
            const cognitoRes = await CognitoClient.adminRemoveAccount({userId});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }
}

export default ProfileController;
