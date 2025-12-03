const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  logger.info('http request', { method: req.method, url: req.originalUrl, ip: req.ip });
  next();
}

module.exports = { requestLogger };
