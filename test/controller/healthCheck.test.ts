import {expect} from 'chai';
import {SinonStub, createSandbox} from 'sinon';
import {HealthCheckController} from '../../lib/controller';
import {MongoDbClient} from '../../lib/clients';
import {MONGO_DB_URL} from '../../lib/utils/constants';

describe('HealthCheck Controller', () => {
    const sandbox = createSandbox();
    let req: any, res: any, next: any;
    let connectToDatabaseStub: SinonStub;
    let disconnectFromDatabaseStub: SinonStub;

    beforeEach(() => {
        connectToDatabaseStub = sandbox.stub(MongoDbClient, 'connectToDatabase');
        disconnectFromDatabaseStub = sandbox.stub(MongoDbClient, 'disconnectFromDatabase');

        req = {};
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
        next = sandbox.spy();
    });

    describe('healthCheck', () => {
        afterEach(() => {
            sandbox.restore();
            req = {};
        });

        it('should return a healthy response when the database connection is successful', async () => {
            connectToDatabaseStub.resolves();
            disconnectFromDatabaseStub.resolves();

            await HealthCheckController.healthCheck(req, res);

            expect(connectToDatabaseStub.calledOnceWithExactly(MONGO_DB_URL)).to.be.true;
            expect(disconnectFromDatabaseStub.calledOnce).to.be.true;
            expect(res.status.calledOnceWithExactly(200)).to.be.true;
            expect(
                res.json.calledOnceWith(
                    sandbox.match({
                        message: 'healthy',
                    }),
                ),
            ).to.be.true;
        });

        it('should return an unhealthy response when the database connection fails', async () => {
            connectToDatabaseStub.rejects(new Error('Database connection failed'));

            await HealthCheckController.healthCheck(req, res);

            expect(connectToDatabaseStub.calledOnceWithExactly(MONGO_DB_URL)).to.be.true;
            expect(res.status.calledOnceWithExactly(500)).to.be.true;
            expect(
                res.json.calledOnceWith(
                    sandbox.match({
                        message: 'unhealthy',
                    }),
                ),
            ).to.be.true;
        });
    });
});
