import {Request, Response} from 'express';
import express from 'express';
import cognitoClient from '../clients/cognitoClient';
import {HttpStatusCode} from '../utils/constants';

interface IUserController {
    signUp: express.Handler;
    signIn: express.Handler;
    confirmSignUp: express.Handler;
}

const userController: IUserController = {
    signUp: async (req: Request, res: Response) => {
        try {
            const {password, email, firstName, lastName} = req.body;
            await cognitoClient.signUp({email, password, firstName, lastName});
            return res.status(HttpStatusCode.OK).json({message: 'you are signed up'});
        } catch (error: any) {
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    confirmSignUp: async (req: Request, res: Response) => {
        try {
            const {email, code} = req.body;
            await cognitoClient.confirmSignUp({email, code});
            return res.status(HttpStatusCode.OK).json({message: 'your signup is confirmed'});
        } catch (error: any) {
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    signIn: async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body;
            await cognitoClient.signIn({email, password});
            return res.status(HttpStatusCode.OK).json({message: 'you are signed in'});
        } catch (error: any) {
            return res.status(error.statusCode).json({error: error.message});
        }
    },
};

export default userController;
