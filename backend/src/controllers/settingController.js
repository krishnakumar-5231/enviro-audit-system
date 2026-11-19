const Setting = require('../models/Setting');
const { logAuditEvent } = require('../utils/auditLogger');

// Default initial settings
const defaultSettings = [
  { key: 'highComplianceThreshold', value: 85, description: 'Percentage threshold for High Compliance rating' },
  { key: 'moderateComplianceThreshold', value: 70, description: 'Percentage threshold for Moderate Compliance rating' },
  { key: 'capaOverdueGracePeriodDays', value: 3, description: 'Days before notification alert for impending CAPA due date' },
  { key: 'organizationName', value: 'Global EcoIndustries Group', description: 'Enterprise organization display name' },
  { key: 'enableAutoAuditNotifications', value: true, description: 'Trigger automatic notifications on audit assignments' }
];

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.find();
    if (settings.length === 0) {
      settings = await Setting.insertMany(defaultSettings);
    }

    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    res.status(200).json({ success: true, data: settingsObj, raw: settings });
  } catch (err) {
    next(err);
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // e.g. { highComplianceThreshold: 90, ... }

    for (const [key, value] of Object.entries(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        { value, updatedBy: req.user._id },
        { upsert: true, new: true }
      );
    }

    await logAuditEvent({
      req,
      action: 'UPDATE',
      entityType: 'System',
      description: 'System configuration settings updated'
    });

    res.status(200).json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    next(err);
  }
};
