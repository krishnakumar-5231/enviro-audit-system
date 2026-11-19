const User = require('../models/User');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (or Admin)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, assignedSites } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Environmental Auditor',
      department: department || 'Environmental Health & Safety (EHS)',
      phone,
      assignedSites: assignedSites || []
    });

    const token = user.generateAuthToken();

    await logAuditEvent({
      user,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      entityCode: user.email,
      description: `New user registered: ${user.name} (${user.role})`
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password').populate('assignedSites', 'name siteCode');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact administrator.' });
    }

    const token = user.generateAuthToken();

    await logAuditEvent({
      user,
      action: 'LOGIN',
      entityType: 'Auth',
      entityId: user._id,
      entityCode: user.email,
      description: `User logged in: ${user.name} (${user.role})`
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
        assignedSites: user.assignedSites
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('assignedSites', 'name siteCode location');
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
        assignedSites: user.assignedSites
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear token log
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    await logAuditEvent({
      req,
      action: 'LOGOUT',
      entityType: 'Auth',
      entityId: req.user._id,
      entityCode: req.user.email,
      description: `User logged out: ${req.user.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};
