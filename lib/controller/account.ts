import {Request, Response} from 'express';
import express from 'express';
import {cognitoClient, neo4jClient} from '../clients';
import {HttpStatusCode} from '../utils/constants';

interface IAccountController {
    register: express.Handler;
    login: express.Handler;
    verifyEmail: express.Handler;
    update: express.Handler;
    forgotPassword: express.Handler;
    confirmForgotPassword: express.Handler;
    removeAccount: express.Handler;
}

const accountController: IAccountController = {
    register: async (req: Request, res: Response, next: any) => {
        try {
            const {email, address, gender, given_name, family_name, birthdate, password} = req.body;
            const cognitoRes = await cognitoClient.register({email, address, gender, given_name, family_name, birthdate, password});

            const query = `CREATE (u:USERS {given_name: $given_name, family_name: $family_name, email: $email, gender: $gender, birthdate: $birthdate}) RETURN u`;
            await neo4jClient.executeCypherQuery(query, {email, address, gender, given_name, family_name, birthdate});

            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },

    verifyEmail: async (req: Request, res: Response, next: any) => {
        try {
            const {email, code} = req.body;
            const cognitoRes = await cognitoClient.verifyEmail({email, code});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },

    login: async (req: Request, res: Response, next: any) => {
        try {
            const {email, password} = req.body;
            const cognitoRes = await cognitoClient.login({email, password});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },

    update: async (req: Request, res: Response, next: any) => {
        try {
            const {attributes} = req.body;
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await cognitoClient.updateUserAttributes({accessToken, attributes});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },

    forgotPassword: async (req: Request, res: Response, next: any) => {
        try {
            const {email} = req.body;
            const cognitoRes = await cognitoClient.forgotPassword({email});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },

    confirmForgotPassword: async (req: Request, res: Response, next: any) => {
        try {
            const {email, password, code} = req.body;
            const cognitoRes = await cognitoClient.confirmForgotPassword({email, password, code});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },

    removeAccount: async (req: Request, res: Response, next: any) => {
        try {
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await cognitoClient.removeAccount({accessToken});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            next(error);
        }
    },
};

export default accountController;
