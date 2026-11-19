const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      default: 'System'
    },
    role: {
      type: String,
      default: 'System'
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'UPDATE',
        'STATUS_CHANGE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'SUBMIT',
        'VERIFY',
        'CLOSE',
        'REJECT',
        'REPORT_GENERATION',
        'EVIDENCE_UPLOAD'
      ]
    },
    entityType: {
      type: String,
      required: true,
      enum: [
        'User',
        'Site',
        'Audit',
        'Inspection',
        'Finding',
        'Capa',
        'Report',
        'Checklist',
        'Auth',
        'System'
      ]
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    entityCode: {
      type: String
    },
    description: {
      type: String,
      required: true
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    details: {
      previousValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

AuditLogSchema.index({ timestamp: -1, entityType: 1, action: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
