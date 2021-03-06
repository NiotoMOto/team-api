const request = require('supertest-as-promised');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const chai = require('chai'); // eslint-disable-line import/newline-after-import
const expect = chai.expect;
const app = require('../../index');
const config = require('../../config/config');
const { validCredentials } = require('../../config/test');
const UserModel = require('../user/user.model');

chai.config.includeStack = true;

describe('## Auth APIs', () => {
  const invalidUserCredentials = {
    username: 'react',
    password: 'IDontKnow'
  };

  before(() => (
    UserModel.remove({ username: validCredentials.username })
  ));

  let jwtToken;
  describe('# POST /api/auth/register', () => {
    it('should register new user and return user & jwt token', (done) => {
      request(app).post('/api/auth/register')
        .send(validCredentials)
        .then((res) => {
          expect(res.body.username).to.equal(validCredentials.username);
          done();
        })
        .catch(done);
    });
    it('should return bad request ( duplicate username )', (done) => {
      request(app).post('/api/auth/register')
        .send(validCredentials)
        .then(() => {
          expect(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
    it('should return bad request ( missing username in req.body)', (done) => {
      request(app).post('/api/auth/register')
        .send({ password: 'tot' })
        .then(() => {
          expect(httpStatus.BAD_REQUEST);
          done();
        })
        .catch(done);
    });
  });


  describe('# POST /api/auth/login', () => {
    it('should return Authentication error', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(invalidUserCredentials)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Authentication error');
          done();
        })
        .catch(done);
    });

    it('should get valid JWT token', (done) => {
      request(app)
        .post('/api/auth/login')
        .send(validCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.property('token');
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(err).to.not.be.ok; // eslint-disable-line no-unused-expressions
            expect(decoded.username).to.equal(validCredentials.username);
            jwtToken = `Bearer ${res.body.token}`;
            done();
          });
        })
        .catch(done);
    });
  });


  describe('# GET /api/auth/random-number', () => {
    it('should fail to get random number because of missing Authorization', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Unauthorized');
          done();
        })
        .catch(done);
    });

    it('should fail to get random number because of wrong token', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .set('Authorization', 'Bearer inValidToken')
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).to.equal('Unauthorized');
          done();
        })
        .catch(done);
    });

    it('should get a random number', (done) => {
      request(app)
        .get('/api/auth/random-number')
        .set('Authorization', jwtToken)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.num).to.be.a('number');
          done();
        })
        .catch(done);
    });
  });
});
