const Finding = require('../models/Finding');
const Inspection = require('../models/Inspection');
const Audit = require('../models/Audit');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all findings with pagination and filters
// @route   GET /api/findings
// @access  Private
exports.getFindings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      severity = '',
      status = '',
      site = '',
      category = '',
      priority = '',
      audit = ''
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { findingCode: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (severity) query.severity = severity;
    if (status) query.status = status;
    if (site) query.site = site;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (audit) query.audit = audit;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Finding.countDocuments(query);
    const findings = await Finding.find(query)
      .populate('audit', 'auditCode title')
      .populate('site', 'name siteCode location')
      .populate('assignedCapa', 'capaCode actionTitle status progressPercentage dueDate')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: findings,
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

// @desc    Get finding by ID
// @route   GET /api/findings/:id
// @access  Private
exports.getFindingById = async (req, res, next) => {
  try {
    const finding = await Finding.findById(req.params.id)
      .populate('audit')
      .populate('site')
      .populate('inspection')
      .populate('assignedCapa')
      .populate('createdBy', 'name email role')
      .populate('closedBy', 'name email');

    if (!finding) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    res.status(200).json({ success: true, data: finding });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new finding
// @route   POST /api/findings
// @access  Private (Auditor / Admin)
exports.createFinding = async (req, res, next) => {
  try {
    const {
      audit,
      inspection,
      site,
      checklistQuestionId,
      checklistItemQuestion,
      title,
      description,
      category,
      severity,
      priority,
      requirementReference
    } = req.body;

    const count = await Finding.countDocuments();
    const year = new Date().getFullYear();
    const findingCode = `FND-${year}-${String(count + 1).padStart(3, '0')}`;

    const newFinding = await Finding.create({
      findingCode,
      audit,
      inspection,
      site,
      checklistQuestionId,
      checklistItemQuestion,
      title,
      description,
      category: category || 'General Environmental',
      severity: severity || 'Medium',
      priority: priority || 'Medium',
      requirementReference,
      status: 'Open',
      createdBy: req.user._id
    });

    // If linked to inspection question item, mark it
    if (inspection && checklistQuestionId) {
      await Inspection.updateOne(
        { _id: inspection, 'items.questionId': checklistQuestionId },
        {
          $set: {
            'items.$.findingCreated': true,
            'items.$.findingId': newFinding._id
          }
        }
      );
    }

    // Alert Compliance Officers and Site Managers
    await createNotification({
      role: 'Compliance Officer',
      type: 'FINDING_CREATED',
      title: 'New Environmental Finding Raised',
      message: `A ${severity} severity non-conformance "${title}" (${findingCode}) was recorded.`,
      relatedEntity: 'Finding',
      entityId: newFinding._id
    });

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'Finding',
      entityId: newFinding._id,
      entityCode: newFinding.findingCode,
      description: `Created finding ${newFinding.findingCode}: "${newFinding.title}" [Severity: ${newFinding.severity}]`
    });

    res.status(201).json({ success: true, data: newFinding });
  } catch (err) {
    next(err);
  }
};

// @desc    Update finding
// @route   PUT /api/findings/:id
// @access  Private
exports.updateFinding = async (req, res, next) => {
  try {
    let finding = await Finding.findById(req.params.id);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    const previousStatus = finding.status;
    finding = await Finding.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await logAuditEvent({
      req,
      action: previousStatus !== finding.status ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'Finding',
      entityId: finding._id,
      entityCode: finding.findingCode,
      description: `Updated finding ${finding.findingCode}`,
      details: { previousStatus, newStatus: finding.status }
    });

    res.status(200).json({ success: true, data: finding });
  } catch (err) {
    next(err);
  }
};

// @desc    Close finding after verification
// @route   POST /api/findings/:id/close
// @access  Private (Compliance Officer / Admin / Auditor)
exports.closeFinding = async (req, res, next) => {
  try {
    const { resolutionRemarks } = req.body;
    let finding = await Finding.findById(req.params.id).populate('assignedCapa');

    if (!finding) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    // Business rule: If CAPA is assigned, it must be Verified or Closed first
    if (finding.assignedCapa && !['Verified', 'Closed'].includes(finding.assignedCapa.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot close finding until the associated CAPA is verified or closed.'
      });
    }

    finding.status = 'Closed';
    finding.resolutionRemarks = resolutionRemarks || 'Verified compliant after corrective action implementation.';
    finding.closedBy = req.user._id;
    finding.closedDate = new Date();
    await finding.save();

    await logAuditEvent({
      req,
      action: 'CLOSE',
      entityType: 'Finding',
      entityId: finding._id,
      entityCode: finding.findingCode,
      description: `Finding ${finding.findingCode} closed and marked resolved.`
    });

    res.status(200).json({ success: true, message: 'Finding successfully closed', data: finding });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload evidence to finding
// @route   POST /api/findings/:id/evidence
// @access  Private
exports.uploadFindingEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an evidence file' });
    }

    const finding = await Finding.findById(req.params.id);
    if (!finding) {
      return res.status(404).json({ success: false, message: 'Finding not found' });
    }

    const evidence = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date()
    };

    finding.evidenceFiles.push(evidence);
    await finding.save();

    await logAuditEvent({
      req,
      action: 'EVIDENCE_UPLOAD',
      entityType: 'Finding',
      entityId: finding._id,
      entityCode: finding.findingCode,
      description: `Uploaded evidence for finding ${finding.findingCode}: ${req.file.originalname}`
    });

    res.status(200).json({ success: true, data: finding, uploadedFile: evidence });
  } catch (err) {
    next(err);
  }
};
