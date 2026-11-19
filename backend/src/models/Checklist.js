const mongoose = require('mongoose');

const ChecklistQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  requirementReference: {
    type: String,
    trim: true
  },
  guidanceNotes: {
    type: String,
    trim: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  isMandatory: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 1
  }
});

const ChecklistSchema = new mongoose.Schema(
  {
    checklistCode: {
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
    description: {
      type: String,
      trim: true
    },
    version: {
      type: String,
      default: '1.0'
    },
    industryType: {
      type: String,
      default: 'General Industrial'
    },
    categories: [
      {
        name: { type: String, required: true },
        description: { type: String }
      }
    ],
    questions: [ChecklistQuestionSchema],
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Archived'],
      default: 'Active'
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

module.exports = mongoose.model('Checklist', ChecklistSchema);
