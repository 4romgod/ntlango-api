import {neo4jClient} from '../clients';

const createEvent = async (event: any) => {
    const {title, description, startDate, startTime, endDate, endTime} = event;
    const eventId = 'someRandomId';
    const query = `CREATE (event:EVENT {
        eventId: $eventId,
        title: $title,
        description: $description,
        startDate: $startDate,
        startTime: $startTime,
        endDate: $endDate,
        endTime: $endTime
    }) RETURN event`;
    const neo4jRes = await neo4jClient.executeCypherQuery(query, {eventId, title, description, startDate, startTime, endDate, endTime});
    return neo4jRes;
};

const readEvent = async (eventId: string) => {
    const query = `MATCH (e:EVENT) WHERE e.eventId=${eventId}`;
    const neo4jRes = await neo4jClient.executeCypherQuery(query);
    return neo4jRes;
};

export default {
    createEvent,
    readEvent,
};
