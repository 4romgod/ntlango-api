import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import {describe} from 'mocha';
import sinon from 'sinon';
import server from '../../lib';
import {HttpStatusCode} from '../../lib/utils/constants';
import {cognitoClient} from '../../lib/clients'
import {userDao} from '../../lib/dao';

chai.use(chaiHttp);

describe('account', () => {
    let sandbox = sinon.createSandbox();

    const accountDetails = {
        email: 'mockEmail@gmail.com',
        address: 'mockAddress',
        gender: 'mockGender',
        given_name: 'mockName',
        family_name: 'mockSurname',
        birthdate: 'mockBirthdate',
        password: 'mockPassword'
    };

    describe('POST /account/register', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('it should create an account and return a user object', (done) => {
            sandbox.stub(cognitoClient, 'register').returns(Promise.resolve({message: 'Successfully registered, confirm user'}));
            sandbox.stub(userDao, 'createUser').returns(Promise.resolve([accountDetails]));

            chai.request(server)
                .post('/api/v1/account/register')
                .send(accountDetails)
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('email').equal('mockEmail@gmail.com');
                    done();
                });
        });
    });
});
