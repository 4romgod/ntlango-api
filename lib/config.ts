import dotenv from 'dotenv';
dotenv.config();

const {
    API_PORT,
    AWS_REGION,
    API_DOMAIN,
    CLIENT_URL,
    COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID,
    COGNITO_IDENTITY_POOL_ID,
    NEO4J_URL,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    NEO4J_DATABASE,
} = process.env;

export {
    API_PORT,
    AWS_REGION,
    API_DOMAIN,
    CLIENT_URL,
    COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID,
    COGNITO_IDENTITY_POOL_ID,
    NEO4J_URL,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    NEO4J_DATABASE,
};
