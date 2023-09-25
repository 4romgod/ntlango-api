import express, {Express} from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import {authRouter, eventsRouter, healthCheckRouter, profileRouter} from './router';
import {API_DOMAIN, API_PORT, CLIENT_URL, MONGO_DB_URL} from './utils/constants';
import {errorHandler, invalidPathHandler} from './utils/middleware';
import {MongoDbClient} from './clients';
import * as cors from 'cors';

const app: Express = express();

const initializeApp = async () => {
    try {
        await MongoDbClient.connectToDatabase(MONGO_DB_URL);

        app.use(morgan('dev'));
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
        app.use(cors.default({origin: `${CLIENT_URL}`, credentials: true}));

        app.use('/api/v1', authRouter);
        app.use('/api/v1', eventsRouter);
        app.use('/api/v1', healthCheckRouter);
        app.use('/api/v1', profileRouter);

        app.use(errorHandler);
        app.use(invalidPathHandler);

        app.listen(API_PORT, () => {
            console.log(`⚡️[server]: Server is running at ${API_DOMAIN}:${API_PORT}`);
            app.emit('appInitialized');
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

initializeApp();

export {app};
