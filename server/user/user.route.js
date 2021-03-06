const express = require('express');
const validate = require('express-validation');
const httpStatus = require('http-status');
const paramValidation = require('../../config/param-validation');
const userCtrl = require('./user.controller');
const expressJwt = require('express-jwt');
const config = require('../../config/config');
const APIError = require('../helpers/APIError');

const router = express.Router(); // eslint-disable-line new-cap

// protect route
router.use(expressJwt({ secret: config.jwtSecret }));
router.use((req, res, next) => {
  if (!req.user.isAdmin) {
    const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED, true);
    return next(err);
  }
  next();
});

router
  .route('/')
  /** GET /api/users - Get list of users */
  .get(userCtrl.list)

  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create);

router
  .route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(validate(paramValidation.updateUser), userCtrl.update)

  /** DELETE /api/users/:userId - Delete user */
  .delete(userCtrl.remove);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;
