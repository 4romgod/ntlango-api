import {Request, Response} from 'express';
import express from 'express';
import {cognitoClient, neo4jClient} from '../clients';
import {HttpStatusCode} from '../utils/constants';

interface IUserController {
    signUp: express.Handler;
    signIn: express.Handler;
    confirmSignUp: express.Handler;
    updateUserAttributes: express.Handler;
}

const userController: IUserController = {
    signUp: async (req: Request, res: Response) => {
        try {
            const {email, address, gender, given_name, family_name, birthdate, password} = req.body;
            await cognitoClient.signUp({email, address, gender, given_name, family_name, birthdate, password});

            const query = `
                CREATE 
                    (user:USERS {given_name: $given_name, family_name: $family_name, email: $email, gender: $gender, birthdate: $birthdate}) 
                RETURN user`;
            const dbRes = await neo4jClient.executeCypherQuery(query, {email, address, gender, given_name, family_name, birthdate});

            return res.status(HttpStatusCode.OK).json(dbRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    confirmSignUp: async (req: Request, res: Response) => {
        try {
            const {email, code} = req.body;
            await cognitoClient.confirmSignUp({email, code});
            return res.status(HttpStatusCode.OK).json({message: 'your signup is confirmed'});
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    signIn: async (req: Request, res: Response) => {
        try {
            const {email, password} = req.body;
            const cognitoRes = await cognitoClient.signIn({email, password});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },

    updateUserAttributes: async (req: Request, res: Response) => {
        try {
            const {accessToken, attributes} = req.body;
            const cognitoRes = await cognitoClient.updateUserAttributes({accessToken, attributes});
            return res.status(HttpStatusCode.OK).json(cognitoRes);
        } catch (error: any) {
            console.log(error);
            return res.status(error.statusCode).json({error: error.message});
        }
    },
};

export default userController;
