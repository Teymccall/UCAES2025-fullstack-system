import { mongoose, Schema, isServer, createModel } from './model-utils';

const auditLogSchema = new Schema({
  action: {
    type: String,
    required: [true, 'Action is required']
  },
  entity: {
    type: String,
    required: [true, 'Entity is required']
  },
  entityId: {
    type: String,
    required: [true, 'Entity ID is required']
  },
  details: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'info'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Staff'
  },
  userType: {
    type: String,
    enum: ['staff', 'student', 'admin', 'system'],
    default: 'system'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  metadata: {
    type: Object
  }
});

// Add indexes for performance - only run server-side
if (isServer) {
  auditLogSchema.index({ action: 1 });
  auditLogSchema.index({ entity: 1, entityId: 1 });
  auditLogSchema.index({ timestamp: -1 });
  auditLogSchema.index({ user: 1 });
  auditLogSchema.index({ status: 1 });
}

// Create and export the model
export const AuditLog = createModel('AuditLog', auditLogSchema, 'auditLogs');

export default AuditLog; 