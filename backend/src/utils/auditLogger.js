const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  req = null,
  user = null,
  action,
  entityType,
  entityId = null,
  entityCode = '',
  description,
  details = {}
}) => {
  try {
    let finalUser = user;
    let ipAddress = '127.0.0.1';

    if (req) {
      if (req.user) finalUser = req.user;
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    }

    const logEntry = new AuditLog({
      user: finalUser ? finalUser._id : null,
      userName: finalUser ? finalUser.name : 'System Operation',
      role: finalUser ? finalUser.role : 'System',
      action,
      entityType,
      entityId,
      entityCode,
      description,
      ipAddress,
      details,
      timestamp: new Date()
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Audit Log Error (non-blocking):', error.message);
  }
};

module.exports = { logAuditEvent };
