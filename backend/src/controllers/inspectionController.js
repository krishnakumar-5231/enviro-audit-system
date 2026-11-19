const Inspection = require('../models/Inspection');
const Audit = require('../models/Audit');
const Checklist = require('../models/Checklist');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all inspections with pagination & filters
// @route   GET /api/inspections
// @access  Private
exports.getInspections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', site = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { inspectionCode: { $regex: search, $options: 'i' } },
        { inspectionCategory: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (site) query.site = site;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Inspection.countDocuments(query);
    const inspections = await Inspection.find(query)
      .populate('audit', 'auditCode title')
      .populate('site', 'name siteCode location')
      .populate('inspector', 'name email')
      .populate('checklist', 'title checklistCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: inspections,
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

// @desc    Get inspection by ID
// @route   GET /api/inspections/:id
// @access  Private
exports.getInspectionById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('audit')
      .populate('site')
      .populate('inspector', 'name email phone department')
      .populate('checklist')
      .populate('items.findingId');

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection record not found' });
    }

    res.status(200).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

// @desc    Create inspection for an audit using a checklist
// @route   POST /api/inspections
// @access  Private (Auditor / Admin)
exports.createInspection = async (req, res, next) => {
  try {
    const { auditId, checklistId, inspectionCategory, remarks } = req.body;

    const audit = await Audit.findById(auditId).populate('site');
    if (!audit) {
      return res.status(404).json({ success: false, message: 'Referenced audit not found' });
    }

    // Check if inspection already exists for this audit
    const existingInsp = await Inspection.findOne({ audit: audit._id });
    if (existingInsp) {
      return res.status(200).json({
        success: true,
        message: 'Inspection already exists for this audit',
        data: existingInsp
      });
    }

    const checklist = await Checklist.findById(checklistId || audit.checklist);
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Please specify a valid checklist' });
    }

    const count = await Inspection.countDocuments();
    const year = new Date().getFullYear();
    const inspectionCode = `INSP-${year}-${String(count + 1).padStart(3, '0')}`;

    // Populate items from checklist questions
    const items = checklist.questions.map((q) => ({
      questionId: q.questionId,
      category: q.category,
      questionText: q.questionText,
      requirementReference: q.requirementReference,
      riskLevel: q.riskLevel,
      response: 'Pending',
      observation: '',
      remarks: '',
      evidenceFiles: [],
      findingCreated: false
    }));

    const inspection = new Inspection({
      inspectionCode,
      audit: audit._id,
      site: audit.site._id,
      inspector: req.user._id,
      checklist: checklist._id,
      inspectionCategory: inspectionCategory || checklist.title,
      remarks,
      items
    });

    inspection.calculateStatistics();
    await inspection.save();

    // Mark audit as In Progress if still Scheduled
    if (audit.status === 'Scheduled') {
      audit.status = 'In Progress';
      audit.startDate = new Date();
      await audit.save();
    }

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'Inspection',
      entityId: inspection._id,
      entityCode: inspection.inspectionCode,
      description: `Initiated inspection ${inspection.inspectionCode} for audit ${audit.auditCode} with ${items.length} checklist items`
    });

    res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inspection checklist items & observations
// @route   PUT /api/inspections/:id
// @access  Private (Auditor / Admin)
exports.updateInspectionItems = async (req, res, next) => {
  try {
    const { items, remarks, overallResult } = req.body;

    let inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    if (items) inspection.items = items;
    if (remarks !== undefined) inspection.remarks = remarks;

    // Recalculate statistics
    inspection.calculateStatistics();
    if (overallResult) inspection.overallResult = overallResult;

    await inspection.save();

    // Sync compliance score with linked audit
    await Audit.findByIdAndUpdate(inspection.audit, {
      complianceScore: inspection.statistics.compliancePercentage
    });

    res.status(200).json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit inspection
// @route   POST /api/inspections/:id/submit
// @access  Private (Auditor / Admin)
exports.submitInspection = async (req, res, next) => {
  try {
    let inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    inspection.calculateStatistics();
    inspection.status = 'Submitted';
    inspection.submittedAt = new Date();
    await inspection.save();

    await Audit.findByIdAndUpdate(inspection.audit, {
      complianceScore: inspection.statistics.compliancePercentage
    });

    await logAuditEvent({
      req,
      action: 'SUBMIT',
      entityType: 'Inspection',
      entityId: inspection._id,
      entityCode: inspection.inspectionCode,
      description: `Submitted inspection ${inspection.inspectionCode}. Score: ${inspection.statistics.compliancePercentage}%.`
    });

    res.status(200).json({
      success: true,
      message: 'Inspection submitted successfully',
      data: inspection
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload evidence to an inspection item
// @route   POST /api/inspections/:id/items/:questionId/evidence
// @access  Private
exports.uploadItemEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { questionId } = req.params;
    const inspection = await Inspection.findById(req.params.id);

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    const item = inspection.items.find((i) => i.questionId === questionId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist question item not found in inspection' });
    }

    const evidence = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date()
    };

    item.evidenceFiles.push(evidence);
    await inspection.save();

    await logAuditEvent({
      req,
      action: 'EVIDENCE_UPLOAD',
      entityType: 'Inspection',
      entityId: inspection._id,
      entityCode: inspection.inspectionCode,
      description: `Uploaded evidence for question ${questionId}: ${req.file.originalname}`
    });

    res.status(200).json({ success: true, data: item, uploadedFile: evidence });
  } catch (err) {
    next(err);
  }
};
