import dotenv from 'dotenv';

dotenv.config();

export const API_DOMAIN = `${process.env.API_DOMAIN}`;
export const API_PORT = `${process.env.API_PORT}`;
export const AWS_REGION = `${process.env.AWS_REGION}`;
export const CLIENT_URL = `${process.env.CLIENT_URL}`;
export const COGNITO_USER_POOL_ID = `${process.env.COGNITO_USER_POOL_ID}`;
export const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
export const COGNITO_IDENTITY_POOL_ID = `${process.env.COGNITO_IDENTITY_POOL_ID}`;
export const MONGO_DB_URL = `${process.env.MONGO_DB_URL}`;

export enum HttpStatusCode {
    OK = 200,
    CREATED = 201,
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
