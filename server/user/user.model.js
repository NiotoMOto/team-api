const Promise = require('bluebird');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcrypt');

const APIError = require('../helpers/APIError');

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

UserSchema.pre('save', function (next) {
  const user = this;

// only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

// generate a salt
  bcrypt.genSalt(10)
  .then((salt) => {
    // hash the password using our new salt
    bcrypt.hash(user.password, salt).then((hash) => {
        // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  }).catch(err => next(err));
});


/**
 * Methods
 */
UserSchema.method({
  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) =>
      bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) return reject(err);
        if (isMatch) return resolve(this);
        reject(new Error('password dont match'));
      }));
  }
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id) {
    return this.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  }
};

/**
 * @typedef User
 */
module.exports = mongoose.model('User', UserSchema);
