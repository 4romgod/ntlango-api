import {expect} from 'chai';
import {SinonStub, createSandbox} from 'sinon';
import mongoose from 'mongoose';
import MongoDbClient from '../../lib/clients/mongoDbClient';

describe('MongoDbClient', () => {
    const sandbox = createSandbox();
    let connectStub: SinonStub;
    let disconnectStub: SinonStub;
    let consoleLogStub: SinonStub;
    let mockDatabaseUrl = 'mongodb://localhost:27017/testdb';

    beforeEach(() => {
        connectStub = sandbox.stub(mongoose, 'connect');
        disconnectStub = sandbox.stub(mongoose, 'disconnect');
        consoleLogStub = sandbox.stub(console, 'log');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('connectToDatabase', () => {
        it('should connect to MongoDB successfully', async () => {
            connectStub.resolves();
            try {
                await MongoDbClient.connectToDatabase(mockDatabaseUrl);
                expect(connectStub.calledOnce).to.be.true;
                expect(consoleLogStub.calledWith('MongoDB connected!')).to.be.true;
            } catch (error) {
                expect.fail('Should not throw an error');
            }
        });

        it('should handle connection errors', async () => {
            connectStub.rejects(new Error('Failed to connect to MongoDB'));
            try {
                await MongoDbClient.connectToDatabase(mockDatabaseUrl);
                expect.fail('Should throw an error');
            } catch (error: any) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.equal('Failed to connect to MongoDB');
                expect(consoleLogStub.calledWith('Failed to connect to MongoDB!')).to.be.true;
            }
        });
    });

    describe('disconnectFromDatabase', () => {
        it('should disconnect from MongoDB successfully', async () => {
            disconnectStub.resolves();
            try {
                await MongoDbClient.disconnectFromDatabase();
                expect(disconnectStub.calledOnce).to.be.true;
                expect(consoleLogStub.calledWith('MongoDB disconnected!')).to.be.true;
            } catch (error) {
                expect.fail('Should not throw an error');
            }
        });

        it('should handle connection errors', async () => {
            disconnectStub.rejects(new Error('Failed to disconnect from MongoDB'));
            try {
                await MongoDbClient.disconnectFromDatabase();
                expect.fail('Should throw an error');
            } catch (error: any) {
                expect(error).to.be.an.instanceOf(Error);
                expect(error.message).to.equal('Failed to disconnect from MongoDB');
                expect(consoleLogStub.calledWith('Failed to disconnect from MongoDB!')).to.be.true;
            }
        });
    });
});
