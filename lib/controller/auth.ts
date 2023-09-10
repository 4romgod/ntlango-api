import {Request, Response} from 'express';
import {HttpStatusCode} from '../utils/constants';
import {CognitoClient} from '../clients';

class AuthController {
    private cognitoClient: CognitoClient;

    constructor(cognitoClient: CognitoClient) {
        this.cognitoClient = cognitoClient;
    }

    async register(req: Request, res: Response, next: any) {
        // TODO use all parameters
        const {address, birthdate, email, family_name, gender, given_name, password, phone_number} = req.body;
        try {
            const cognitoRes = await this.cognitoClient.register({
                address,
                birthdate,
                email,
                family_name,
                gender,
                given_name,
                password,
                phone_number,
            });
            console.log('called cognito', cognitoRes);
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: any) {
        try {
            const {email, password} = req.body;
            const cognitoRes = await this.cognitoClient.login({email, password});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: any) {
        try {
            // TODO use the actual access token
            await this.cognitoClient.logout({accessToken: ''});
            return res.status(HttpStatusCode.OK).json({
                message: 'Successfully logged out',
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default AuthController;
