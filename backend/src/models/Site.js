const mongoose = require('mongoose');

const SiteSchema = new mongoose.Schema(
  {
    siteCode: {
      type: String,
      required: [true, 'Please provide a unique site code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: [true, 'Please provide a site name'],
      trim: true,
      maxlength: [150, 'Site name cannot exceed 150 characters']
    },
    industryType: {
      type: String,
      required: [true, 'Please specify industry type'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: 'United States',
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid contact email']
    },
    contactPhone: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Renovation', 'Decommissioned'],
      default: 'Active'
    },
    environmentalClearanceNumber: {
      type: String,
      trim: true
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

SiteSchema.index({ name: 'text', siteCode: 'text', city: 'text' });

module.exports = mongoose.model('Site', SiteSchema);
