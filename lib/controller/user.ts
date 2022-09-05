import {Request, Response} from 'express';
import express from 'express';
import cognitoUserPoolHelper from '../utils/cognitoUserPoolHelper';
import {HttpStatusCode} from '../utils/constants';

interface IUserController {
    signUp: express.Handler;
    signIn: express.Handler;
    confirmSignUp: express.Handler;
}

const userController: IUserController = {
    signUp: async (req: Request, res: Response) => {
        const {password, email, firstName, lastName} = req.body;
        await cognitoUserPoolHelper.signUp({email, password, firstName, lastName});
        return res.status(HttpStatusCode.OK).json({message: 'you are signed up'});
    },

    confirmSignUp: async (req: Request, res: Response) => {
        const {email, code} = req.body;
        await cognitoUserPoolHelper.confirmSignUp({email, code});
        return res.status(HttpStatusCode.OK).json({message: 'your signup is confirmed'});
    },

    signIn: async (req: Request, res: Response) => {
        const {email, password} = req.body;
        await cognitoUserPoolHelper.signIn({email, password});
        return res.status(HttpStatusCode.OK).json({message: 'you are signed in'});
    },
};

export default userController;
