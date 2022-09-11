import {HttpStatusCode} from './constants';

export interface NtlangoError extends Error {
    statusCode: number;
    errorType: string;
}

/**
 * @desc Return HTTP Exception for given statusCode, errorType and errorMsg
 * @param {string} statusCode - the HTTP status code of the HTTP Exception
 * @param {string} errorType - the error type of the HTTP Exception
 * @param {string} errorMsg - the error message of the HTTP Exception
 * @return {object} Error object
 */
export const HttpException = (statusCode: number, errorType: string, message: string): NtlangoError => {
    const err: NtlangoError = Object.assign(Error(), {statusCode, errorType, message});
    Error.captureStackTrace(err, HttpException);
    return err;
};

/**
 * @desc Return InvalidArgumentException Exception for given errorMsg
 * @param {string} errorMsg - the error message of the InvalidArgumentException Exception
 * @return {object} Error object
 */
export const InvalidArgumentException = (errorMsg: string): NtlangoError => {
    const error = HttpException(HttpStatusCode.BAD_REQUEST, 'InvalidArgumentException', errorMsg);
    Error.captureStackTrace(error, InvalidArgumentException);
    return error;
};

/**
 * @desc Return UnauthenticatedException Exception for given errorMsg
 * @param {string} errorMsg - the error message of the UnauthenticatedException Exception
 * @return {object} Error object
 */
export const UnauthenticatedException = (errorMsg: string): NtlangoError => {
    const error = HttpException(HttpStatusCode.UNAUTHENTICATED, 'UnauthenticatedException', errorMsg);
    Error.captureStackTrace(error, UnauthenticatedException);
    return error;
};

/**
 * @desc Return UnauthorizedException Exception for given errorMsg
 * @param {string} errorMsg - the error message of the UnauthorizedException Exception
 * @return {object} Error object
 */
export const UnauthorizedException = (errorMsg: string): NtlangoError => {
    const error = HttpException(HttpStatusCode.UNAUTHORIZED, 'UnauthorizedException', errorMsg);
    Error.captureStackTrace(error, UnauthorizedException);
    return error;
};

/**
 * @desc ResourceNotFoundException 404 when the resource is not found
 * @param {string} errorMsg - the error message of the ResourceNotFoundException Exception
 * @return {object} Error object
 */
export const ResourceNotFoundException = (errorMsg: string): NtlangoError => {
    const error = HttpException(HttpStatusCode.NOT_FOUND, 'ResourceNotFoundException', errorMsg);
    Error.captureStackTrace(error, ResourceNotFoundException);
    return error;
};

/**
 * @desc Return InternalServiceErrorException Exception for given errorMsg
 * @param {string} errorMsg - the error message of the InternalServiceErrorException Exception
 * @return {object} Error object
 */
export const InternalServiceErrorException = (errorMsg: string): NtlangoError => {
    const error = HttpException(HttpStatusCode.INTERNAL_SERVER, 'InternalServiceErrorException', errorMsg);
    Error.captureStackTrace(error, InternalServiceErrorException);
    return error;
};
