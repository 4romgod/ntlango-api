import {NtlangoError, ResourceNotFoundException} from '../utils/exceptions';
import {Request, Response} from 'express';
import {HttpStatusCode} from './constants';

export const errorHandler = (error: NtlangoError, request: Request, response: Response, next: any) => {
    console.log(error);
    return response
        .status(error.statusCode || HttpStatusCode.INTERNAL_SERVER)
        .header('Content-Type', 'application/json')
        .send({error});
};

export const invalidPathHandler = (request: Request, response: Response, next: any) => {
    const error = ResourceNotFoundException(`Invalid Path: '${request.path}'`);
    return response.status(HttpStatusCode.NOT_FOUND).send({error});
};
