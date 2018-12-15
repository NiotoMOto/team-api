const request = require('supertest-as-promised');
const app = require('../../index');
const { validCredentials } = require('../../config/test');

module.exports = {
  loginBefore: (done, setToken) => {
    request(app)
  .post('/api/auth/login')
  .send(validCredentials)
  .then((res) => {
    setToken(`Bearer ${res.body.token}`);
  })
  .finally(() => {
    done();
  });
  }
};
