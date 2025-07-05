import mongoose from 'mongoose';
import { MongoClient, MongoClientOptions, ServerApiVersion, Db } from 'mongodb';

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    console.log("=> using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("=> using new database connection");
    const opts = {
      dbName: process.env.DB_NAME || 'student_system',
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000,
      bufferCommands: false, // Disable Mongoose's buffering
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log(`Mongoose connected to database: ${mongoose.connection.db.databaseName}`);
      return mongoose;
    }).catch(error => {
      console.error('Mongoose connection error:', error.message);
      if (error.name === 'MongoServerSelectionError') {
        console.error('Could not connect to any servers in your MongoDB Atlas cluster. Check IP whitelist.');
      }
      // Set promise to null so a new connection can be attempted
      cached.promise = null;
      throw new Error('Database connection failed.');
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the promise was rejected, clear it so we can try again
    cached.promise = null;
    throw e; // Re-throw the error to be caught by the calling function
  }
  
  return cached.conn;
}

// A function to connect to the database (exporting the robust one)
export { connectToDatabase };

// Connection status tracking - DEPRECATED
// let isConnected = false;

// Log the URI to debug
if (process.env.NODE_ENV !== 'production') {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Please check your .env.local file.');
  }
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const mongoClientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

export async function connectToMongoClient() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, mongoClientOptions);
    const db = client.db();
    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (e: unknown) {
    console.error("Failed to connect to MongoDB with MongoClient", e);
    if (e instanceof Error && e.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB cluster. Check IP whitelist settings.');
    }
    throw e;
  }
}

// Add a function to test the connection
export async function testMongoDBConnection() {
  try {
    // First test mongoose connection
    await connectToDatabase();
    
    // Then get the native client
    const conn = await connectToMongoClient();
    const collections = await conn.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    return {
      success: true,
      collections: collections.map(c => c.name),
      database: conn.db.databaseName,
    };
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Export mongoose to be used in other files
export { mongoose };