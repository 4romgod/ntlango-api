import express, {Express} from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRouter from './router/user';
import healthCheckRouter from './router/healthCheck';

dotenv.config();

const app: Express = express();
app.use(morgan('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/api/v1', authRouter);
app.use('/api/v1', healthCheckRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
