import express, { Express } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRouter from './route/auth';

dotenv.config();

const app: Express = express();
app.use(morgan('dev'));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', authRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
