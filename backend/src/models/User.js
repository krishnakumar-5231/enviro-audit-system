const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['Administrator', 'Environmental Auditor', 'Site Manager', 'Compliance Officer'],
      default: 'Environmental Auditor',
      required: true
    },
    assignedSites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Site'
      }
    ],
    phone: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      default: 'Environmental Health & Safety (EHS)'
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    },
    avatar: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET || 'super_secret_jwt_key_enviro_audit_2026_secure',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
