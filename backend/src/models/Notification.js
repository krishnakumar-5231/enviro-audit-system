const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'AUDIT_ASSIGNED',
        'AUDIT_APPROACHING',
        'AUDIT_OVERDUE',
        'FINDING_CREATED',
        'CAPA_ASSIGNED',
        'CAPA_DUE_SOON',
        'CAPA_OVERDUE',
        'CAPA_SUBMITTED',
        'CAPA_VERIFIED',
        'CAPA_REJECTED',
        'AUDIT_COMPLETED',
        'REPORT_GENERATED',
        'GENERAL_SYSTEM'
      ],
      default: 'GENERAL_SYSTEM'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedEntity: {
      type: String,
      enum: ['Site', 'Audit', 'Inspection', 'Finding', 'Capa', 'Report', 'User']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
