import {Request, Response} from 'express';
import express from 'express';
import {cognitoClient, neo4jClient} from '../clients';
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

            const query = `CREATE (user:USERS {firstName: $firstName, lastName: $lastName, email: $email}) RETURN user`;
            const dbRes = await neo4jClient.executeCypherQuery(query, {email, firstName, lastName});

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
};

export default userController;
