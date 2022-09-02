import * as neo4j from 'neo4j-driver';
import 'dotenv/config';

export interface GetAllProps {
    label: string;
}

class Neo4jHelper {
    public neo4jSession: neo4j.Session;

    constructor() {
        const driver = neo4j.driver(`${process.env.NEO4J_URL}`, neo4j.auth.basic(`${process.env.NEO4J_USERNAME}`, `${process.env.NEO4J_PASSWORD}`));
        this.neo4jSession = driver.session({ database: `${process.env.NEO4J_DATABASE}` });
    }

    public async getAll(props: GetAllProps) {
        const query = `MATCH (u:${props.label}) RETURN u`;
        try {
            const result = await this.neo4jSession.run(query);
            return result.records.map(i => i.get('u').properties);
        } catch(error) {
            console.log(error);
        }
    }
}

export default new Neo4jHelper();
