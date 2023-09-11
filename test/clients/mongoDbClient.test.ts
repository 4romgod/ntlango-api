import {expect} from 'chai';
import sinon from 'sinon';
import {connect} from 'mongoose';
import MongoDbClient from '../../lib/clients/mongoDbClient';

describe('MongoDbClient', () => {
    let mongoDbClient: MongoDbClient;
    let connectStub: any;
    let consoleLogStub: any;

    beforeEach(() => {
        mongoDbClient = new MongoDbClient('mongodb://localhost:27017/testdb');
        connectStub = sinon.stub(connect);
        consoleLogStub = sinon.stub(console, 'log');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initialize with the provided database URL', () => {
        expect(mongoDbClient).to.have.property('databaseUrl', 'mongodb://localhost:27017/testdb');
    });

    it('should connect to MongoDB successfully', async () => {
        connectStub.resolves();
        try {
            await mongoDbClient.connectToDatabase();
            expect(connectStub.calledOnce).to.be.true;
            expect(consoleLogStub.calledWith('connecting to MongoDB...')).to.be.true;
            expect(consoleLogStub.calledWith('MongoDB connected!')).to.be.true;
        } catch (error) {
            expect.fail('Should not throw an error');
        }
    });

    it('should handle connection errors', async () => {
        connectStub.rejects(new Error('Failed to connect to MongoDB'));
        try {
            await mongoDbClient.connectToDatabase();
            expect.fail('Should throw an error');
        } catch (error: any) {
            expect(error).to.be.an.instanceOf(Error);
            expect(error.message).to.equal('Failed to connect to MongoDB');
            expect(consoleLogStub.calledWith('connecting to MongoDB...')).to.be.true;
            expect(consoleLogStub.calledWith('Failed to connect to MongoDB!')).to.be.true;
        }
    });
});
