import { Request, Response } from 'express';

export const signup = (req: Request, res: Response) => {
    return res.status(200).json({message: 'you are signed up'});
};

export const signout = (req: Request, res: Response) => {
    return res.status(200).json({message: 'you are signed out'});
};
