import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils/constants';
import {CognitoClient} from '../clients';

class ProfileController {
    private cognitoClient: CognitoClient;

    constructor(cognitoClient: CognitoClient) {
        this.cognitoClient = cognitoClient;
    }

    async updateProfile(req: Request, res: Response, next: any) {
        try {
            const {attributes} = req.body;
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await this.cognitoClient.updateUserAttributes({accessToken, attributes});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: any) {
        try {
            const {email} = req.body;
            const cognitoRes = await this.cognitoClient.forgotPassword({email});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    async confirmForgotPassword(req: Request, res: Response, next: any) {
        try {
            const {email, password, code} = req.body;
            const cognitoRes = await this.cognitoClient.confirmForgotPassword({email, password, code});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    async removeProfile(req: Request, res: Response, next: any) {
        try {
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await this.cognitoClient.removeAccount({accessToken});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    async adminRemoveProfile(req: Request, res: Response, next: any) {
        try {
            const {username} = req.params;
            const cognitoRes = await this.cognitoClient.adminRemoveAccount({username});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }
}

export default ProfileController;
