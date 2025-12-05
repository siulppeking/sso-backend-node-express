const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

/**
 * MongoDB connection options
 */
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

/**
 * Get MongoDB URI from environment
 */
function getMongoURI() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sso_db';
  return uri;
}

/**
 * Handle connection events
 */
function setupConnectionHandlers() {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected', { host: mongoose.connection.host });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  mongoose.connection.on('error', error => {
    logger.error('MongoDB connection error', { error: error.message });
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
}

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    const uri = getMongoURI();

    logger.info('Connecting to MongoDB', { uri: uri.replace(/:[^/]*@/, ':***@') });

    await mongoose.connect(uri, connectionOptions);

    setupConnectionHandlers();

    logger.info('✅ MongoDB connection established');
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB', { error: error.message });
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Failed to disconnect from MongoDB', { error: error.message });
    throw error;
  }
}

/**
 * Check MongoDB connection status
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get connection stats
 */
function getConnectionStats() {
  const connection = mongoose.connection;
  return {
    host: connection.host,
    port: connection.port,
    name: connection.name,
    readyState: connection.readyState,
    collections: connection.collections ? Object.keys(connection.collections) : [],
  };
}

module.exports = {
  connectDB,
  disconnectDB,
  isConnected,
  getConnectionStats,
  getMongoURI,
  connectionOptions,
};

