import {NtlangoError, ResourceNotFoundException} from '../utils/exceptions';
import {Request, Response} from 'express';
import {HttpStatusCode} from './constants';

/**
 * This middleware handles errors that are not handled in the controllers
 * @param error
 * @param request
 * @param response
 * @param next
 * @returns
 */
export const errorHandler = (error: NtlangoError, request: Request, response: Response, next: any) => {
    console.log(error);
    return response
        .status(error.statusCode || HttpStatusCode.INTERNAL_SERVER)
        .header('Content-Type', 'application/json')
        .json(error);
};

export const invalidPathHandler = (request: Request, response: Response, next: any) => {
    const error = ResourceNotFoundException(`Invalid Path: '${request.path}'`);
    return response.status(HttpStatusCode.NOT_FOUND).json(error);
};
