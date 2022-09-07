import * as neo4j from 'neo4j-driver';
import 'dotenv/config';
import {InternalServiceErrorException} from '../utils/exceptions';

const {NEO4J_URL, NEO4J_USERNAME, NEO4J_PASSWORD} = process.env;

/**
 * https://medium.com/nirman-tech-blog/crud-operation-using-expressjs-and-neo4j-ccdfcd40ae15
 */
class Neo4jClient {
    public neo4jDriver: neo4j.Driver;
    public neo4jSession: neo4j.Session;

    constructor() {
        this.neo4jDriver = neo4j.driver(`${NEO4J_URL}`, neo4j.auth.basic(`${NEO4J_USERNAME}`, `${NEO4J_PASSWORD}`));
        this.neo4jSession = this.neo4jDriver.session();
    }

    public async executeCypherQuery(statement: string, params = {}) {
        try {
            const result = await this.neo4jSession.run(statement, params);
            return this.formatResponse(result);
        } catch (error) {
            console.log('Error while calling neo4j', error);
            throw InternalServiceErrorException('Failed to call the database');
        }
    }

    /**
     * This function takes a neo4j response object and formats it nicely.
     * @param resultObj Neo4j Result Object
     * @returns
     */
    public formatResponse(resultObj: any) {
        const result: any[] = [];
        if (resultObj.records.length > 0) {
            resultObj.records.map((record: any) => {
                result.push(record._fields[0].properties);
            });
        }
        return result;
    }
}

export default new Neo4jClient();
