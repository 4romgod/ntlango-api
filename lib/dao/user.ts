import {neo4jClient} from '../clients';

const createUser = async (user: any) => {
    const {email, given_name, family_name, address, gender, birthdate} = user;
    const query = `CREATE (u:USERS { email: $email, given_name: $given_name, family_name: $family_name, gender: $gender, birthdate: $birthdate}) RETURN u`;
    const neo4jRes = await neo4jClient.executeCypherQuery(query, {email, given_name, family_name, address, gender, birthdate});
    return neo4jRes;
};

export default {
    createUser,
};
