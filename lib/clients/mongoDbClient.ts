import {connect} from 'mongoose';

class MongoDbClient {
    private databaseUrl: string;

    constructor(databaseUrl: string) {
        console.log('Initializing MongoDB Client...');
        this.databaseUrl = databaseUrl;
    }

    public async connectToDatabase() {
        console.log('connecting to MongoDB...');
        try {
            await connect(this.databaseUrl);
            console.log('MongoDB connected!');
        } catch (error) {
            console.log('Failed to connect to MongoDB!');
            throw error;
        }
    }
}

export default MongoDbClient;
