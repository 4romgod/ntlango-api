import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import {describe} from 'mocha';
import server from '../../lib';
import {HttpStatusCode} from '../../lib/utils/constants';

chai.use(chaiHttp);

/**
 * This way of testing is well documented in the articles
 *
 * https://www.digitalocean.com/community/tutorials/test-a-node-restful-api-with-mocha-and-chai
 * https://mherman.org/blog/testing-node-js-with-mocha-and-chai/
 */
describe('healthcheck', () => {
    describe('GET /healthcheck', () => {
        it('it should return healthcheck object', (done) => {
            chai.request(server)
                .get('/api/v1/healthcheck')
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.have.property('uptime');
                    expect(res.body).to.have.property('message').equal('OK');
                    expect(res.body).to.have.property('timestamp');
                    done();
                });
        });
    });
});
