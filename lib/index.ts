import express, {Express} from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import accountRouter from './router/account';
import healthCheckRouter from './router/healthCheck';
import * as cors from 'cors';
import {CLIENT_URL, API_PORT, API_DOMAIN} from './config';

dotenv.config();

const app: Express = express();
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors.default({origin: `${CLIENT_URL}`, credentials: true}));

app.use('/api/v1', accountRouter);
app.use('/api/v1', healthCheckRouter);

app.listen(API_PORT, () => {
    console.log(`⚡️[server]: Server is running at ${API_DOMAIN}:${API_PORT}`);
});
