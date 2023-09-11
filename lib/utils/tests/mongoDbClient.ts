class MockMongoDbClient {
    private databaseUrl: string;

    constructor(databaseUrl: string) {
        this.databaseUrl = databaseUrl;
    }

    async connectToDatabase() {
        return Promise.resolve();
    }
}

export default MockMongoDbClient;
