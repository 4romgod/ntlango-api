import Neo4jClient from './neo4jClient';
import CognitoClient from './cognitoClient';

const cognitoClient = new CognitoClient();
const neo4jClient = new Neo4jClient();

export {neo4jClient, cognitoClient};
