import chai, {expect} from 'chai';
import chaiHttp from 'chai-http';
import {describe} from 'mocha';
import sinon from 'sinon';
import server from '../../lib';
import {HttpStatusCode} from '../../lib/utils/constants';
import {eventsDao} from '../../lib/dao';

chai.use(chaiHttp);

describe('events', () => {
    const mockEvent = {
        title: 'mockTitle',
        description: 'mock description',
        startDate: 'mockStartDate',
        startTime: 'mockStartTime',
        endDate: 'mockEndDate',
        endTime: 'mockEndTime',
    };

    describe('POST /events', () => {
        sinon.stub(eventsDao, 'createEvent').returns(Promise.resolve([{...mockEvent, eventId: 'someRandomId'}]));

        it('it should create an events and return an event object', (done) => {
            chai.request(server)
                .post('/api/v1/events')
                .send(mockEvent)
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.be.a('object');
                    expect(res.body).to.have.property('eventId');
                    done();
                });
        });
    });

    describe('GET /events', () => {
        it('it should return events array', (done) => {
            chai.request(server)
                .get('/api/v1/events')
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.have.property('message').equal('You have successfully read all events');
                    done();
                });
        });
    });

    describe('GET /events/eventId', () => {
        it('it should return an event object', (done) => {
            const mockEventId = 'mockEventId';
            chai.request(server)
                .get(`/api/v1/events/${mockEventId}`)
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.have.property('message').equal(`You have successfully read an event with ID: ${mockEventId}`);
                    done();
                });
        });
    });

    describe('PUT /events/eventId', () => {
        it('it should update and return an event object', (done) => {
            const mockEventId = 'mockEventId';
            chai.request(server)
                .put(`/api/v1/events/${mockEventId}`)
                .send(mockEvent)
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.have.property('message').equal(`You have successfully updated an event with ID: ${mockEventId}`);
                    done();
                });
        });
    });

    describe('DELETE /events/eventId', () => {
        it('it should delete and return an event object', (done) => {
            const mockEventId = 'mockEventId';
            chai.request(server)
                .delete(`/api/v1/events/${mockEventId}`)
                .end((err, res) => {
                    expect(res.status).to.be.equal(HttpStatusCode.OK);
                    expect(res.body).to.have.property('message').equal(`You have successfully deleted an event with ID: ${mockEventId}`);
                    done();
                });
        });
    });
});
