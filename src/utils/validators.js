const { body } = require('express-validator');

const registerValidators = [
  body('username').isString().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
];

module.exports = { registerValidators };
