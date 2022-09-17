import express, {Express} from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import {healthCheckRouter, accountRouter, eventsRouter} from './router';
import {CLIENT_URL, API_PORT, API_DOMAIN} from './config';
import {errorHandler, invalidPathHandler} from './utils/middleware';
import * as cors from 'cors';

dotenv.config();

const app: Express = express();

app.use(morgan('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors.default({origin: `${CLIENT_URL}`, credentials: true}));

app.use('/api/v1', accountRouter);
app.use('/api/v1', healthCheckRouter);
app.use('/api/v1', eventsRouter);

app.use(errorHandler);
app.use(invalidPathHandler);

app.listen(API_PORT, () => {
    console.log(`⚡️[server]: Server is running at ${API_DOMAIN}:${API_PORT}`);
});
