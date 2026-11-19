const mongoose = require('mongoose');

const FindingSchema = new mongoose.Schema(
  {
    findingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    audit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true
    },
    checklistQuestionId: {
      type: String
    },
    checklistItemQuestion: {
      type: String
    },
    title: {
      type: String,
      required: [true, 'Please provide finding title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide finding description'],
      trim: true
    },
    category: {
      type: String,
      required: true,
      default: 'General Environmental'
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      required: true
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    requirementReference: {
      type: String,
      trim: true
    },
    evidenceFiles: [
      {
        originalName: String,
        fileName: String,
        filePath: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: [
        'Open',
        'CAPA Assigned',
        'In Progress',
        'Pending Verification',
        'Resolved',
        'Closed',
        'Rejected'
      ],
      default: 'Open'
    },
    assignedCapa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Capa'
    },
    resolutionRemarks: {
      type: String
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    closedDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

FindingSchema.index({ findingCode: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Finding', FindingSchema);
