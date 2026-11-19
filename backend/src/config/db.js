const mongoose = require('mongoose');

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const primaryUri = process.env.MONGO_URI || (!process.env.VERCEL ? 'mongodb://127.0.0.1:27017/enviro_audit_db' : null);

  if (!primaryUri && process.env.VERCEL) {
    console.error('MONGO_URI is missing. Please set your MongoDB Atlas connection string in Vercel Environment Variables.');
    return;
  }

  try {
    // Attempt connecting to the configured URI (e.g. local mongod or MongoDB Atlas)
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.warn(`Primary database connection at ${primaryUri} not available (${error.message}).`);

    // In local development mode only, fallback to embedded MongoMemoryServer
    if (!process.env.VERCEL) {
      try {
        console.log('Starting embedded MongoDB Server for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create({
          instance: { dbName: 'enviro_audit_db' }
        });
        const memoryUri = mongoMemoryServerInstance.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log(`Embedded MongoDB Connected: ${conn.connection.host} (${memoryUri})`);
        await autoSeedIfEmpty();
      } catch (fallbackErr) {
        console.error(`Embedded database startup failed: ${fallbackErr.message}`);
        process.exit(1);
      }
    }
  }
};

const autoSeedIfEmpty = async () => {
  try {
    const User = require('../models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Automatically initializing demo dataset...');
      const seedDB = require('../seed/seeder');
      await seedDB();
    }
  } catch (seedErr) {
    console.warn('Auto-seed check notice:', seedErr.message);
  }
};

module.exports = connectDB;
