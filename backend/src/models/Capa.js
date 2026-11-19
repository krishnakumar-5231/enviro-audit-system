const mongoose = require('mongoose');

const CapaCommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CapaSchema = new mongoose.Schema(
  {
    capaCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    finding: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Finding',
      required: true
    },
    audit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true
    },
    actionTitle: {
      type: String,
      required: [true, 'Please provide an action title'],
      trim: true
    },
    problemStatement: {
      type: String,
      required: [true, 'Please provide problem statement'],
      trim: true
    },
    rootCause: {
      type: String,
      trim: true
    },
    correctiveAction: {
      type: String,
      trim: true
    },
    preventiveAction: {
      type: String,
      trim: true
    },
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a responsible person']
    },
    assignedDepartment: {
      type: String,
      default: 'Site EHS Operations'
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'High'
    },
    dueDate: {
      type: Date,
      required: [true, 'Please set a due date']
    },
    status: {
      type: String,
      enum: [
        'Open',
        'Assigned',
        'In Progress',
        'Pending Verification',
        'Verified',
        'Closed',
        'Overdue'
      ],
      default: 'Assigned'
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
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
    comments: [CapaCommentSchema],
    verificationRemarks: {
      type: String
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedDate: {
      type: Date
    },
    rejectionRemarks: {
      type: String
    },
    completedDate: {
      type: Date
    },
    closedDate: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to check if overdue
CapaSchema.virtual('isOverdue').get(function () {
  if (['Verified', 'Closed'].includes(this.status)) return false;
  return new Date() > new Date(this.dueDate);
});

CapaSchema.index({ capaCode: 'text', actionTitle: 'text' });

module.exports = mongoose.model('Capa', CapaSchema);
