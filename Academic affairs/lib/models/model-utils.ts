import mongoose, { Schema } from 'mongoose';

// Determine if we're running on the server
export const isServer = typeof window === 'undefined';

/**
 * Creates a MongoDB model with proper handling for Next.js environment
 * @param modelName Name of the model
 * @param schema Mongoose schema
 * @param collectionName Optional collection name (defaults to lowercase plural of modelName)
 * @returns The mongoose model
 */
export function createModel(modelName: string, schema: Schema, collectionName?: string) {
  // Only actually create/register models on the server side
  if (isServer) {
    // Check if the model already exists to prevent the "Cannot overwrite model" error
    return mongoose.models[modelName] || 
      mongoose.model(modelName, schema, collectionName);
  }
  
  // On the client side, just return a placeholder
  return null;
}

// Export for use in other model files
export { Schema, mongoose }; 