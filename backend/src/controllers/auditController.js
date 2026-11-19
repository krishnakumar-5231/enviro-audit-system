const Audit = require('../models/Audit');
const Site = require('../models/Site');
const Inspection = require('../models/Inspection');
const Finding = require('../models/Finding');
const Capa = require('../models/Capa');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all audits with pagination, search, status and site filters
// @route   GET /api/audits
// @access  Private
exports.getAudits = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      site = '',
      auditType = '',
      priority = ''
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { auditCode: { $regex: search, $options: 'i' } },
        { scope: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (site) query.site = site;
    if (auditType) query.auditType = auditType;
    if (priority) query.priority = priority;

    // If Site Manager, filter to their assigned sites
    if (req.user.role === 'Site Manager' && req.user.assignedSites?.length > 0) {
      query.site = { $in: req.user.assignedSites };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Audit.countDocuments(query);
    const audits = await Audit.find(query)
      .populate('site', 'name siteCode location city')
      .populate('leadAuditor', 'name email department')
      .populate('checklist', 'title checklistCode questions')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: audits,
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

// @desc    Get single audit with linked inspection, findings and CAPA
// @route   GET /api/audits/:id
// @access  Private
exports.getAuditById = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id)
      .populate('site')
      .populate('leadAuditor', 'name email phone department')
      .populate('auditTeam', 'name email department')
      .populate('checklist');

    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    // Related inspection
    const inspection = await Inspection.findOne({ audit: audit._id }).populate('inspector', 'name email');

    // Related findings
    const findings = await Finding.find({ audit: audit._id })
      .populate('assignedCapa')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Related CAPA
    const capas = await Capa.find({ audit: audit._id })
      .populate('responsiblePerson', 'name email')
      .populate('finding', 'title findingCode severity')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        audit,
        inspection,
        findings,
        capas
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new audit
// @route   POST /api/audits
// @access  Private (Admin / Auditor)
exports.createAudit = async (req, res, next) => {
  try {
    const {
      title,
      site,
      auditType,
      leadAuditor,
      auditTeam,
      scheduledDate,
      scope,
      objectives,
      description,
      priority,
      checklist
    } = req.body;

    const count = await Audit.countDocuments();
    const year = new Date().getFullYear();
    const auditCode = `AUD-${year}-${String(count + 1).padStart(3, '0')}`;

    const audit = await Audit.create({
      auditCode,
      title,
      site,
      auditType: auditType || 'Internal Environmental Audit',
      leadAuditor,
      auditTeam: auditTeam || [],
      scheduledDate,
      scope,
      objectives,
      description,
      priority: priority || 'High',
      checklist,
      createdBy: req.user._id
    });

    const populatedAudit = await Audit.findById(audit._id)
      .populate('site', 'name siteCode')
      .populate('leadAuditor', 'name email');

    // Notify assigned lead auditor
    await createNotification({
      userId: leadAuditor,
      type: 'AUDIT_ASSIGNED',
      title: 'New Environmental Audit Assigned',
      message: `You have been assigned as Lead Auditor for ${populatedAudit.title} at ${populatedAudit.site?.name}.`,
      relatedEntity: 'Audit',
      entityId: audit._id
    });

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'Audit',
      entityId: audit._id,
      entityCode: audit.auditCode,
      description: `Scheduled audit ${audit.auditCode}: "${audit.title}" at site ${populatedAudit.site?.name}`
    });

    res.status(201).json({ success: true, data: populatedAudit });
  } catch (err) {
    next(err);
  }
};

// @desc    Update audit
// @route   PUT /api/audits/:id
// @access  Private
exports.updateAudit = async (req, res, next) => {
  try {
    let audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    const previousStatus = audit.status;
    audit = await Audit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('site', 'name siteCode')
      .populate('leadAuditor', 'name email');

    await logAuditEvent({
      req,
      action: previousStatus !== audit.status ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'Audit',
      entityId: audit._id,
      entityCode: audit.auditCode,
      description: `Updated audit ${audit.auditCode} details`,
      details: { previousStatus, newStatus: audit.status }
    });

    res.status(200).json({ success: true, data: audit });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete audit
// @route   DELETE /api/audits/:id
// @access  Private (Admin)
exports.deleteAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    await Audit.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      req,
      action: 'DELETE',
      entityType: 'Audit',
      entityId: audit._id,
      entityCode: audit.auditCode,
      description: `Deleted audit record ${audit.auditCode}`
    });

    res.status(200).json({ success: true, message: 'Audit deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Start audit execution
// @route   POST /api/audits/:id/start
// @access  Private (Auditor / Admin)
exports.startAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    audit.status = 'In Progress';
    if (!audit.startDate) audit.startDate = new Date();
    await audit.save();

    await logAuditEvent({
      req,
      action: 'STATUS_CHANGE',
      entityType: 'Audit',
      entityId: audit._id,
      entityCode: audit.auditCode,
      description: `Audit ${audit.auditCode} started and is now In Progress.`
    });

    res.status(200).json({ success: true, message: 'Audit started', data: audit });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit audit for review
// @route   POST /api/audits/:id/submit
// @access  Private (Auditor / Admin)
exports.submitAudit = async (req, res, next) => {
  try {
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    // Verify inspection exists
    const inspection = await Inspection.findOne({ audit: audit._id });
    if (!inspection) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit audit without completing the site inspection.'
      });
    }

    audit.status = 'Under Review';
    await audit.save();

    // Notify Compliance Officers
    await createNotification({
      role: 'Compliance Officer',
      type: 'AUDIT_APPROACHING',
      title: 'Audit Submitted For Review',
      message: `Audit ${audit.auditCode} has been submitted for compliance verification and closure review.`,
      relatedEntity: 'Audit',
      entityId: audit._id
    });

    await logAuditEvent({
      req,
      action: 'SUBMIT',
      entityType: 'Audit',
      entityId: audit._id,
      entityCode: audit.auditCode,
      description: `Audit ${audit.auditCode} submitted for compliance review.`
    });

    res.status(200).json({ success: true, message: 'Audit submitted for review', data: audit });
  } catch (err) {
    next(err);
  }
};

// @desc    Complete and close audit
// @route   POST /api/audits/:id/complete
// @access  Private (Compliance Officer / Admin)
exports.completeAudit = async (req, res, next) => {
  try {
    const { completionRemarks } = req.body;
    const audit = await Audit.findById(req.params.id);
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Audit not found' });
    }

    // Check inspection
    const inspection = await Inspection.findOne({ audit: audit._id });
    if (inspection) {
      inspection.calculateStatistics();
      await inspection.save();
      audit.complianceScore = inspection.statistics.compliancePercentage;
    }

    audit.status = 'Completed';
    audit.endDate = new Date();
    if (completionRemarks) audit.completionRemarks = completionRemarks;
    await audit.save();

    await createNotification({
      role: 'Administrator',
      type: 'AUDIT_COMPLETED',
      title: 'Environmental Audit Completed',
      message: `Audit ${audit.auditCode} has been formally completed with compliance score of ${audit.complianceScore}%.`,
      relatedEntity: 'Audit',
      entityId: audit._id
    });

    await logAuditEvent({
      req,
      action: 'CLOSE',
      entityType: 'Audit',
      entityId: audit._id,
      entityCode: audit.auditCode,
      description: `Audit ${audit.auditCode} closed and marked Completed with score ${audit.complianceScore}%.`
    });

    res.status(200).json({ success: true, message: 'Audit successfully completed', data: audit });
  } catch (err) {
    next(err);
  }
};
