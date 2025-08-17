// Determine if we're running on the server
export const isServer = typeof window === 'undefined';

/**
 * Firebase schema definition type for model fields
 */
export interface SchemaField {
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'map' | 'reference';
  required?: boolean;
  default?: any;
  enum?: any[];
  min?: number;
  max?: number;
  ref?: string; // For references to other collections
}

/**
 * Firebase schema definition
 */
export interface Schema {
  [key: string]: SchemaField | Schema;
}

/**
 * Creates a schema definition for Firebase models
 * @param definition The schema definition
 * @returns The schema object
 */
export function Schema(definition: Record<string, any>) {
  return definition;
}

/**
 * Creates a Firebase model with proper handling for Next.js environment
 * @param modelName Name of the model
 * @param schema Schema definition
 * @param collectionName Collection name in Firestore
 * @returns The model name and collection mapping
 */
export function createModel(modelName: string, schema: any, collectionName?: string) {
  // Just return the collection name for Firebase
  return collectionName || modelName.toLowerCase() + 's';
}

// Placeholder for mongoose compatibility
export const mongoose = {
  models: {},
  model: (name: string) => ({ name })
}; 