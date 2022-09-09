import {Request, Response} from 'express';
import express from 'express';
import {cognitoClient, neo4jClient} from '../clients';
import {HttpStatusCode} from '../utils/constants';

interface IUserController {
    register: express.Handler;
    login: express.Handler;
    verifyEmail: express.Handler;
    update: express.Handler;
    forgotPassword: express.Handler;
    confirmForgotPassword: express.Handler;
    removeAccount: express.Handler;
}

const userController: IUserController = {
    register: async (req: Request, res: Response) => {
        try {
            const {email, address, gender, given_name, family_name, birthdate, password} = req.body;
            const cognitoRes = await cognitoClient.register({email, address, gender, given_name, family_name, birthdate, password});

            const query = `CREATE (u:USERS {given_name: $given_name, family_name: $family_name, email: $email, gender: $gender, birthdate: $birthdate}) RETURN u`;
            await neo4jClient.executeCypherQuery(query, {email, address, gender, given_name, family_name, birthdate});

            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    verifyEmail: async (req: Request, res: Response) => {
        try {
            const {email, code} = req.body;
            const cognitoRes = await cognitoClient.verifyEmail({email, code});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body;
            const cognitoRes = await cognitoClient.login({email, password});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const {attributes} = req.body;
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await cognitoClient.updateUserAttributes({accessToken, attributes});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    forgotPassword: async (req: Request, res: Response) => {
        try {
            const {email} = req.body;
            const cognitoRes = await cognitoClient.forgotPassword({email});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    confirmForgotPassword: async (req: Request, res: Response) => {
        try {
            const {email, password, code} = req.body;
            const cognitoRes = await cognitoClient.confirmForgotPassword({email, password, code});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    removeAccount: async (req: Request, res: Response) => {
        try {
            const accessToken = req.headers.authorization || '';
            const cognitoRes = await cognitoClient.removeAccount({accessToken});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },
};

export default userController;
