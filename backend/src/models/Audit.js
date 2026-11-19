const mongoose = require('mongoose');

const AuditSchema = new mongoose.Schema(
  {
    auditCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: [true, 'Please associate a site with the audit']
    },
    title: {
      type: String,
      required: [true, 'Please provide an audit title'],
      trim: true
    },
    auditType: {
      type: String,
      enum: [
        'Internal Environmental Audit',
        'Compliance Audit',
        'Site Inspection',
        'Periodic Audit',
        'Follow-up Audit'
      ],
      default: 'Internal Environmental Audit',
      required: true
    },
    leadAuditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please designate a lead auditor']
    },
    auditTeam: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    scheduledDate: {
      type: Date,
      required: [true, 'Please provide scheduled date']
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Scheduled',
        'In Progress',
        'Submitted',
        'Under Review',
        'Completed',
        'Closed',
        'Cancelled'
      ],
      default: 'Scheduled'
    },
    scope: {
      type: String,
      default: 'Comprehensive site-wide environmental compliance audit across air, water, hazardous waste, and statutory reporting.'
    },
    objectives: {
      type: String,
      default: 'Verify regulatory adherence, evaluate operational environmental controls, identify non-conformances, and establish corrective action plans.'
    },
    description: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High'
    },
    checklist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checklist'
    },
    complianceScore: {
      type: Number,
      default: 0
    },
    completionRemarks: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

AuditSchema.index({ auditCode: 'text', title: 'text' });

module.exports = mongoose.model('Audit', AuditSchema);
