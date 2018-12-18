const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const APIError = require('../helpers/APIError');
const config = require('../../config/config');
const UserModel = require('../user/user.model');


/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  UserModel.findOne({ username: req.body.username })
    .then(user => (
      user.comparePassword(req.body.password)
    ))
    .then((user) => {
      const token = jwt.sign({
        username: user.username
      }, config.jwtSecret);
      return res.json({
        token,
        username: user.username,
        id: user._id
      });
    })
    .catch(() => {
      const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
      return next(err);
    });
}

function register(req, res, next) {
  const { username, password } = req.body;
  UserModel.create({ username, password }).then((user) => {
    if (user) {
      const token = jwt.sign({
        username: user.username
      }, config.jwtSecret);
      return res.json({
        token,
        username: user.username,
        id: user._id
      });
    }
    throw new Error('Bad request');
  }).catch(() => {
    const err = new APIError('Register error', httpStatus.BAD_REQUEST, true);
    return next(err);
  });
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = { login, getRandomNumber, register };
