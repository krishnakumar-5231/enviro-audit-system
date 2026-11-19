const AuditLog = require('../models/AuditLog');

// @desc    Get system audit logs with filters & search
// @route   GET /api/audit-logs
// @access  Private (Admin / Compliance Officer)
exports.getAuditLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 15,
      search = '',
      action = '',
      entityType = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { entityCode: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: logs,
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
