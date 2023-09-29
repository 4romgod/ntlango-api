import {expect} from 'chai';
import {createSandbox} from 'sinon';
import {HealthCheckController} from '../../lib/controller';
import {HealthCheckState} from '@ntlango/api-client';

describe('HealthCheck Controller', () => {
    const sandbox = createSandbox();
    let req: any, res: any, next: any;

    beforeEach(() => {
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
            await HealthCheckController.healthCheck(req, res);

            expect(res.status.calledOnceWithExactly(200)).to.be.true;
            expect(
                res.json.calledOnceWith(
                    sandbox.match({
                        state: HealthCheckState.Healthy,
                    }),
                ),
            ).to.be.true;
        });

        // it('should return an unhealthy response when the database connection fails', async () => {
        //     await HealthCheckController.healthCheck(req, res);

        //     expect(res.status.calledOnceWithExactly(500)).to.be.true;
        //     expect(
        //         res.json.calledOnceWith(
        //             sandbox.match({
        //                 state: HealthCheckState.Unhealthy,
        //             }),
        //         ),
        //     ).to.be.true;
        // });
    });
});
