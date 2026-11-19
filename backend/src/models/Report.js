const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reportCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    reportType: {
      type: String,
      enum: [
        'Environmental Audit Report',
        'Inspection Report',
        'Compliance Summary',
        'CAPA Status Report',
        'Site Compliance Report',
        'Periodic Compliance Report'
      ],
      default: 'Environmental Audit Report',
      required: true
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Site',
      required: true
    },
    audit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit'
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    generationDate: {
      type: Date,
      default: Date.now
    },
    periodStart: {
      type: Date
    },
    periodEnd: {
      type: Date
    },
    executiveSummary: {
      type: String
    },
    complianceScore: {
      type: Number,
      default: 0
    },
    metricsSnapshot: {
      totalFindings: { type: Number, default: 0 },
      criticalFindings: { type: Number, default: 0 },
      highFindings: { type: Number, default: 0 },
      mediumFindings: { type: Number, default: 0 },
      lowFindings: { type: Number, default: 0 },
      totalCapa: { type: Number, default: 0 },
      closedCapa: { type: Number, default: 0 },
      overdueCapa: { type: Number, default: 0 },
      compliancePercentage: { type: Number, default: 0 },
      overallEvaluation: { type: String, default: 'Satisfactory' }
    },
    recommendations: {
      type: String
    },
    statutoryDisclaimer: {
      type: String,
      default: 'This document is a formal internal compliance and environmental audit report compiled from verified operational records. It reflects site condition and regulatory alignment at the time of inspection.'
    },
    pdfFileName: {
      type: String
    },
    pdfFilePath: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

ReportSchema.index({ reportCode: 'text', title: 'text' });

module.exports = mongoose.model('Report', ReportSchema);
