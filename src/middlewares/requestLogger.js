const fs = require('fs');
const path = require('path');

function requestLogger(req, res, next) {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}\n`;
  // append to a simple log file (for demo purposes)
  try {
    const logPath = path.join(process.cwd(), 'logs', 'requests.log');
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, log);
  } catch (err) {
    // ignore logging errors
  }
  next();
}

module.exports = { requestLogger };
