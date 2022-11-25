export enum HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHENTICATED = 401,
    UNAUTHORIZED = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
}

export const REGEX = {
    ACCESS_TOKEN: /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/,
};

export const NUMBER_OF_RETRIES = 3;
export const TIMEOUT_MILLI = 8000;
export const CONNECTION_TIMEOUT_MILLI = 500;
