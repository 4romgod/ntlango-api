import { Request, Response } from 'express';
import express from 'express';
import cognitoUserPoolHelper from '../utils/cognitoUserPoolHelper';

interface IUserController {
  signUp: express.Handler,
  signIn: express.Handler,
  confirmSignUp: express.Handler,
  getProfile: express.Handler,
};

const userController: IUserController = {
    signUp: async (req: Request, res: Response) => {
        try {
            console.log('calling signup');
            const { password, email, firstName, lastName } = req.body;
            const result = await cognitoUserPoolHelper.signUp({ email, password, firstName, lastName });
            res.status(200).json({ message: 'you are signed up' });
        } catch (err: any) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    },

    confirmSignUp: async (req: Request, res: Response) => {
        const { email, code } = req.body;
        const result = await cognitoUserPoolHelper.confirmSignUp({ email, code });
        res.status(200).json({ message: 'your signup is confirmed' });
    },

    signIn: async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await cognitoUserPoolHelper.signIn({ email, password });
        res.status(200).json({ message: 'you are signed in' });
    },

    getProfile: (req: Request, res: Response) => {
        res.status(200).json({ message: 'here is your profile' });
    },
};

export default userController;