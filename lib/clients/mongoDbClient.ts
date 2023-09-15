import {connect, disconnect} from 'mongoose';

class MongoDbClient {
    static async connectToDatabase(databaseUrl: string) {
        try {
            await connect(databaseUrl);
            console.log('MongoDB connected!');
        } catch (error) {
            console.log('Failed to connect to MongoDB!');
            throw error;
        }
    }

    static async disconnectToDatabase() {
        try {
            await disconnect();
            console.log('MongoDB disconnected!');
        } catch (error) {
            console.log('Failed to disconnect to MongoDB!');
            throw error;
        }
    }
}

export default MongoDbClient;
