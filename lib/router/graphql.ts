import {Router} from 'express';
import {graphqlHTTP} from 'express-graphql';
import {graphqlSchema} from '../graphql/schema';

const router = Router();

router.post(
    '/graphql',
    graphqlHTTP((request) => {
        const startTime = Date.now();
        return {
            schema: graphqlSchema,
            graphiql: true,
            extensions() {
                return {
                    runTime: Date.now() - startTime,
                };
            },
        };
    }),
);

export default router;
