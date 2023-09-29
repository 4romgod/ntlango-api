import {expect} from 'chai';
import {createSandbox, SinonSandbox, SinonSpy, SinonStub} from 'sinon';
import {ProfileController} from '../../lib/controller';
import {HttpStatusCode} from '../../lib/utils';
import {CognitoClient} from '../../lib/clients';

describe('ProfileController', () => {
    let sandbox: SinonSandbox;
    let req: any, res: any, next: SinonSpy;
    let updateUserAttributesStub: SinonStub;
    let forgotPasswordStub: SinonStub;
    let confirmForgotPasswordStub: SinonStub;
    let removeAccountStub: SinonStub;
    let adminRemoveAccountStub: SinonStub;

    beforeEach(() => {
        sandbox = createSandbox();
        updateUserAttributesStub = sandbox.stub(CognitoClient, 'updateUserAttributes');
        forgotPasswordStub = sandbox.stub(CognitoClient, 'forgotPassword');
        confirmForgotPasswordStub = sandbox.stub(CognitoClient, 'confirmForgotPassword');
        removeAccountStub = sandbox.stub(CognitoClient, 'removeAccount');
        adminRemoveAccountStub = sandbox.stub(CognitoClient, 'adminRemoveAccount');

        req = {};
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
        next = sandbox.spy();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('updateProfile', () => {
        afterEach(() => {
            sandbox.restore();
        });

        beforeEach(() => {
            req = {
                body: {
                    attributes: [
                        {
                            Name: 'first_name',
                            Value: 'UpdatedName',
                        },
                    ],
                },
                headers: {
                    authorization: 'mockAuthToken',
                },
            };
        });

        it('should update user profile attributes successfully', async () => {
            updateUserAttributesStub.resolves({first_name: 'UpdatedName'});

            await ProfileController.updateProfile(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({first_name: 'UpdatedName'})).to.be.true;
            expect(next.called).to.be.false;
            expect(updateUserAttributesStub.args[0][0]).to.deep.equal({accessToken: req.headers.authorization, updateInput: req.body});
        });

        it('should handle errors during profile update', async () => {
            const error = new Error('Profile update failed');
            updateUserAttributesStub.rejects(error);

            await ProfileController.updateProfile(req, res, next);

            expect(next.calledOnceWith(error)).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Profile update failed');
            expect(updateUserAttributesStub.args[0][0]).to.deep.equal({accessToken: req.headers.authorization, updateInput: req.body});
        });
    });

    describe('forgotPassword', () => {
        afterEach(() => {
            sandbox.restore();
        });

        beforeEach(() => {
            req = {
                body: {
                    email: 'test@example.com',
                },
            };
        });

        it('should send a forgot password request successfully', async () => {
            forgotPasswordStub.resolves({message: 'Successfully called forgot password'});

            await ProfileController.forgotPassword(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'Successfully called forgot password'})).to.be.true;
            expect(forgotPasswordStub.args[0][0]).to.deep.equal({email: req.body.email});
            expect(next.called).to.be.false;
        });

        it('should handle errors during forgot password request', async () => {
            const error = new Error('Forgot password request failed');
            forgotPasswordStub.rejects(error);

            await ProfileController.forgotPassword(req, res, next);

            expect(next.calledOnceWith(error)).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Forgot password request failed');
            expect(forgotPasswordStub.args[0][0]).to.deep.equal({email: req.body.email});
        });
    });

    describe('confirmForgotPassword', () => {
        afterEach(() => {
            sandbox.restore();
        });

        beforeEach(() => {
            req = {
                body: {
                    email: 'test@example.com',
                    password: 'mockPassord',
                    code: '1234',
                },
            };
        });

        it('should confirm forgot password request successfully', async () => {
            confirmForgotPasswordStub.resolves({message: 'Successfully confirmed update password'});

            await ProfileController.confirmForgotPassword(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'Successfully confirmed update password'})).to.be.true;
            expect(confirmForgotPasswordStub.args[0][0]).to.deep.equal(req.body);
            expect(next.called).to.be.false;
        });

        it('should handle errors during confirm forgot password request', async () => {
            const error = new Error('Confirm forgot password request failed');
            confirmForgotPasswordStub.rejects(error);

            await ProfileController.confirmForgotPassword(req, res, next);

            expect(next.calledOnceWith(error)).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Confirm forgot password request failed');
            expect(confirmForgotPasswordStub.args[0][0]).to.deep.equal(req.body);
        });
    });

    describe('removeProfile', () => {
        afterEach(() => {
            sandbox.restore();
        });

        beforeEach(() => {
            req = {
                headers: {
                    authorization: 'mockAuthToken',
                },
            };
        });

        it('should confirm forgot password request successfully', async () => {
            removeAccountStub.resolves({message: 'Successfully removed account'});

            await ProfileController.removeProfile(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'Successfully removed account'})).to.be.true;
            expect(removeAccountStub.args[0][0]).to.deep.equal({accessToken: req.headers.authorization});
            expect(next.called).to.be.false;
        });

        it('should handle errors during confirm forgot password request', async () => {
            const error = new Error('Remove profile request failed');
            removeAccountStub.rejects(error);

            await ProfileController.removeProfile(req, res, next);

            expect(next.calledOnceWith(error)).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Remove profile request failed');
            expect(removeAccountStub.args[0][0]).to.deep.equal({accessToken: req.headers.authorization});
        });
    });

    describe('adminRemoveProfile', () => {
        afterEach(() => {
            sandbox.restore();
        });

        beforeEach(() => {
            req = {
                params: {
                    userId: 'mockUserId',
                },
            };
        });

        it('should remove the user profile by admin successfully', async () => {
            adminRemoveAccountStub.resolves({message: 'Successfully removed account'});

            await ProfileController.adminRemoveProfile(req, res, next);

            expect(res.status.calledOnceWith(HttpStatusCode.OK)).to.be.true;
            expect(res.json.calledOnceWith({message: 'Successfully removed account'})).to.be.true;
            expect(adminRemoveAccountStub.args[0][0]).to.deep.equal({userId: req.params.userId});
            expect(next.called).to.be.false;
        });

        it('should handle errors during admin profile removal', async () => {
            const error = new Error('Admin profile removal failed');
            adminRemoveAccountStub.rejects(error);

            await ProfileController.adminRemoveProfile(req, res, next);

            expect(next.calledOnceWith(error)).to.be.true;
            expect(res.status.notCalled).to.be.true;
            expect(res.json.notCalled).to.be.true;
            expect(next.args[0][0].message).to.equal('Admin profile removal failed');
            expect(adminRemoveAccountStub.args[0][0]).to.deep.equal({userId: req.params.userId});
        });
    });
});
