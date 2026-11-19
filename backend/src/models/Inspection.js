const mongoose = require('mongoose');

const InspectionItemSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  requirementReference: {
    type: String
  },
  response: {
    type: String,
    enum: ['Compliant', 'Non-Compliant', 'Partially Compliant', 'Not Applicable', 'Pending'],
    default: 'Pending'
  },
  observation: {
    type: String,
    default: ''
  },
  remarks: {
    type: String,
    default: ''
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
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
  findingCreated: {
    type: Boolean,
    default: false
  },
  findingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Finding'
  }
});

const InspectionSchema = new mongoose.Schema(
  {
    inspectionCode: {
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
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    checklist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Checklist',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    inspectionCategory: {
      type: String,
      default: 'Comprehensive Environmental Inspection'
    },
    status: {
      type: String,
      enum: ['Draft', 'In Progress', 'Submitted', 'Approved'],
      default: 'In Progress'
    },
    items: [InspectionItemSchema],
    statistics: {
      totalItems: { type: Number, default: 0 },
      compliantCount: { type: Number, default: 0 },
      nonCompliantCount: { type: Number, default: 0 },
      partiallyCompliantCount: { type: Number, default: 0 },
      notApplicableCount: { type: Number, default: 0 },
      compliancePercentage: { type: Number, default: 0 }
    },
    overallResult: {
      type: String,
      enum: ['Compliant / Satisfactory', 'Minor Non-Conformances', 'Action Required', 'Pending Evaluation'],
      default: 'Pending Evaluation'
    },
    remarks: {
      type: String
    },
    submittedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Method to recalculate statistics
InspectionSchema.methods.calculateStatistics = function () {
  const items = this.items || [];
  let total = items.length;
  let compliant = 0;
  let nonCompliant = 0;
  let partiallyCompliant = 0;
  let notApplicable = 0;

  items.forEach((item) => {
    if (item.response === 'Compliant') compliant++;
    else if (item.response === 'Non-Compliant') nonCompliant++;
    else if (item.response === 'Partially Compliant') partiallyCompliant++;
    else if (item.response === 'Not Applicable') notApplicable++;
  });

  const applicableItems = total - notApplicable;
  // Compliant = 1 point, Partially Compliant = 0.5 points
  const complianceScorePoints = compliant + (partiallyCompliant * 0.5);
  const compliancePercentage = applicableItems > 0
    ? Math.round((complianceScorePoints / applicableItems) * 100)
    : 100;

  this.statistics = {
    totalItems: total,
    compliantCount: compliant,
    nonCompliantCount: nonCompliant,
    partiallyCompliantCount: partiallyCompliant,
    notApplicableCount: notApplicable,
    compliancePercentage: Math.min(100, Math.max(0, compliancePercentage))
  };

  if (nonCompliant === 0 && partiallyCompliant === 0) {
    this.overallResult = 'Compliant / Satisfactory';
  } else if (nonCompliant <= 2 && partiallyCompliant <= 2) {
    this.overallResult = 'Minor Non-Conformances';
  } else {
    this.overallResult = 'Action Required';
  }

  return this.statistics;
};

module.exports = mongoose.model('Inspection', InspectionSchema);
