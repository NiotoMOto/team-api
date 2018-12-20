const request = require('supertest-as-promised');
const app = require('../../index');
const UserModel = require('../user/user.model');

const loginBefore = (user, setToken) =>
  request(app)
    .post('/api/auth/login')
    .send(user)
    .then((res) => {
      setToken(`Bearer ${res.body.token}`);
    });

const createUser = (user) => {
  const newUser = new UserModel(user);
  return newUser.save();
};

const removeUser = user => UserModel.remove({ userName: user.userName });

module.exports = {
  loginBefore,
  createUser,
  removeUser
};
