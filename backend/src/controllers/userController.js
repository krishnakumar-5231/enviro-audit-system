const User = require('../models/User');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all users with search, role filter & pagination
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('assignedSites', 'name siteCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('assignedSites', 'name siteCode location');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, phone, assignedSites, status } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Password@123',
      role,
      department,
      phone,
      assignedSites,
      status: status || 'Active'
    });

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'User',
      entityId: user._id,
      entityCode: user.email,
      description: `Admin created user ${user.name} with role ${user.role}`
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, department, phone, assignedSites, status, password } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.department = department || user.department;
    user.phone = phone !== undefined ? phone : user.phone;
    if (assignedSites) user.assignedSites = assignedSites;
    if (status) user.status = status;
    if (password) user.password = password; // Will trigger pre-save hook

    await user.save();

    await logAuditEvent({
      req,
      action: 'UPDATE',
      entityType: 'User',
      entityId: user._id,
      entityCode: user.email,
      description: `User details updated for ${user.name}`
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, data: userObj });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      req,
      action: 'DELETE',
      entityType: 'User',
      entityId: user._id,
      entityCode: user.email,
      description: `Admin deleted user ${user.name} (${user.email})`
    });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
