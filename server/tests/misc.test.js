const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const { loginBefore, createUser, removeUser } = require('../helpers/test');
const { validAdmin } = require('../../config/test');

let jwtToken;
const setToken = (token) => {
  jwtToken = token;
};

chai.config.includeStack = true;

describe('## Misc', () => {
  before((done) => {
    removeUser(validAdmin)
      .then(() => createUser(validAdmin))
      .then(() => loginBefore(validAdmin, setToken))
      .then(() => done())
      .catch(err => console.log('MISC BEFORE ERROR', err));
  });
  describe('# GET /api/health-check', () => {
    it('should return OK', (done) => {
      console.log('TOKKKKEN', jwtToken);
      request(app)
        .get('/api/health-check')
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.text).to.equal('OK');
          done();
        })
        .catch(done);
    });
  });

  describe('# GET /api/404', () => {
    it('should return 404 status', (done) => {
      request(app)
        .get('/api/404')
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.message).to.equal('Not Found');
          done();
        })
        .catch(done);
    });
  });

  describe('# Error Handling', () => {
    it('should handle mongoose CastError - Cast to ObjectId failed', (done) => {
      request(app)
        .get('/api/users/56z787zzz67fc')
        .set('Authorization', jwtToken)
        .expect(httpStatus.INTERNAL_SERVER_ERROR)
        .then((res) => {
          expect(res.body.message).to.equal('Internal Server Error');
          done();
        })
        .catch(done);
    });

    it('should handle express validation error - password is required', (done) => {
      request(app)
        .post('/api/users')
        .set('Authorization', jwtToken)
        .send({
          username: 'Hugo'
        })
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          expect(res.body.message).to.equal('"password" is required');
          done();
        })
        .catch(done);
    });
  });
});
