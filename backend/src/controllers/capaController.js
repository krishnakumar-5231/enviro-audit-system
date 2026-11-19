const Capa = require('../models/Capa');
const Finding = require('../models/Finding');
const Audit = require('../models/Audit');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all CAPAs with pagination, search & filters
// @route   GET /api/capa
// @access  Private
exports.getCapas = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      priority = '',
      site = '',
      responsiblePerson = '',
      overdue = ''
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { capaCode: { $regex: search, $options: 'i' } },
        { actionTitle: { $regex: search, $options: 'i' } },
        { problemStatement: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (site) query.site = site;
    if (responsiblePerson) query.responsiblePerson = responsiblePerson;

    if (overdue === 'true') {
      query.dueDate = { $lt: new Date() };
      query.status = { $nin: ['Verified', 'Closed'] };
    }

    // Site Manager view
    if (req.user.role === 'Site Manager' && req.user.assignedSites?.length > 0) {
      query.site = { $in: req.user.assignedSites };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Capa.countDocuments(query);
    const capas = await Capa.find(query)
      .populate('finding', 'findingCode title severity category')
      .populate('audit', 'auditCode title')
      .populate('site', 'name siteCode location')
      .populate('responsiblePerson', 'name email department')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Dynamic overdue check
    const now = new Date();
    const capasWithOverdue = capas.map((c) => {
      const obj = c.toObject();
      obj.isOverdue = !['Verified', 'Closed'].includes(c.status) && new Date(c.dueDate) < now;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: capasWithOverdue,
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

// @desc    Get CAPA by ID
// @route   GET /api/capa/:id
// @access  Private
exports.getCapaById = async (req, res, next) => {
  try {
    const capa = await Capa.findById(req.params.id)
      .populate('finding')
      .populate('audit')
      .populate('site')
      .populate('responsiblePerson', 'name email phone department')
      .populate('verifiedBy', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('comments.user', 'name role avatar');

    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA record not found' });
    }

    const obj = capa.toObject();
    obj.isOverdue = !['Verified', 'Closed'].includes(capa.status) && new Date(capa.dueDate) < new Date();

    res.status(200).json({ success: true, data: obj });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new CAPA
// @route   POST /api/capa
// @access  Private
exports.createCapa = async (req, res, next) => {
  try {
    const {
      finding,
      audit,
      site,
      actionTitle,
      problemStatement,
      rootCause,
      correctiveAction,
      preventiveAction,
      responsiblePerson,
      assignedDepartment,
      priority,
      dueDate
    } = req.body;

    const count = await Capa.countDocuments();
    const year = new Date().getFullYear();
    const capaCode = `CAPA-${year}-${String(count + 1).padStart(3, '0')}`;

    const newCapa = await Capa.create({
      capaCode,
      finding,
      audit,
      site,
      actionTitle,
      problemStatement,
      rootCause,
      correctiveAction,
      preventiveAction,
      responsiblePerson,
      assignedDepartment: assignedDepartment || 'EHS Site Operations',
      priority: priority || 'High',
      dueDate,
      status: 'Assigned',
      createdBy: req.user._id
    });

    // Link CAPA back to finding
    await Finding.findByIdAndUpdate(finding, {
      assignedCapa: newCapa._id,
      status: 'CAPA Assigned'
    });

    // Notify assigned responsible person
    await createNotification({
      userId: responsiblePerson,
      type: 'CAPA_ASSIGNED',
      title: 'CAPA Action Assigned to You',
      message: `You have been assigned as lead owner for CAPA action: ${newCapa.actionTitle} (${newCapa.capaCode}) with due date ${new Date(dueDate).toLocaleDateString()}.`,
      relatedEntity: 'Capa',
      entityId: newCapa._id
    });

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'Capa',
      entityId: newCapa._id,
      entityCode: newCapa.capaCode,
      description: `Created CAPA ${newCapa.capaCode}: "${newCapa.actionTitle}" assigned to user ${responsiblePerson}`
    });

    res.status(201).json({ success: true, data: newCapa });
  } catch (err) {
    next(err);
  }
};

// @desc    Update CAPA (progress, root cause, corrective action)
// @route   PUT /api/capa/:id
// @access  Private
exports.updateCapa = async (req, res, next) => {
  try {
    let capa = await Capa.findById(req.params.id);
    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA record not found' });
    }

    const previousStatus = capa.status;
    const {
      actionTitle,
      problemStatement,
      rootCause,
      correctiveAction,
      preventiveAction,
      progressPercentage,
      priority,
      dueDate,
      assignedDepartment,
      status
    } = req.body;

    if (actionTitle) capa.actionTitle = actionTitle;
    if (problemStatement) capa.problemStatement = problemStatement;
    if (rootCause !== undefined) capa.rootCause = rootCause;
    if (correctiveAction !== undefined) capa.correctiveAction = correctiveAction;
    if (preventiveAction !== undefined) capa.preventiveAction = preventiveAction;
    if (priority) capa.priority = priority;
    if (dueDate) capa.dueDate = dueDate;
    if (assignedDepartment) capa.assignedDepartment = assignedDepartment;

    if (progressPercentage !== undefined) {
      capa.progressPercentage = Number(progressPercentage);
      // Auto move status from Assigned to In Progress
      if (capa.status === 'Assigned' && capa.progressPercentage > 0) {
        capa.status = 'In Progress';
      }
    }

    if (status && ['Assigned', 'In Progress'].includes(status)) {
      capa.status = status;
    }

    await capa.save();

    await logAuditEvent({
      req,
      action: previousStatus !== capa.status ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'Capa',
      entityId: capa._id,
      entityCode: capa.capaCode,
      description: `Updated CAPA ${capa.capaCode} (Progress: ${capa.progressPercentage}%)`,
      details: { previousStatus, newStatus: capa.status }
    });

    res.status(200).json({ success: true, data: capa });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit CAPA for verification
// @route   POST /api/capa/:id/submit
// @access  Private
exports.submitCapa = async (req, res, next) => {
  try {
    let capa = await Capa.findById(req.params.id);
    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA record not found' });
    }

    if (!capa.correctiveAction || !capa.rootCause) {
      return res.status(400).json({
        success: false,
        message: 'Root cause and corrective action must be documented before submitting for verification.'
      });
    }

    capa.status = 'Pending Verification';
    capa.progressPercentage = 100;
    capa.completedDate = new Date();
    await capa.save();

    // Also update finding status
    await Finding.findByIdAndUpdate(capa.finding, { status: 'Pending Verification' });

    // Notify Compliance Officers and Auditors
    await createNotification({
      role: 'Compliance Officer',
      type: 'CAPA_SUBMITTED',
      title: 'CAPA Submitted for Verification',
      message: `Action ${capa.capaCode} ("${capa.actionTitle}") was submitted for verification and closure review.`,
      relatedEntity: 'Capa',
      entityId: capa._id
    });

    await logAuditEvent({
      req,
      action: 'SUBMIT',
      entityType: 'Capa',
      entityId: capa._id,
      entityCode: capa.capaCode,
      description: `CAPA ${capa.capaCode} submitted for verification.`
    });

    res.status(200).json({
      success: true,
      message: 'CAPA submitted for verification',
      data: capa
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify CAPA (Approve or Reject)
// @route   POST /api/capa/:id/verify
// @access  Private (Compliance Officer / Admin / Auditor)
exports.verifyCapa = async (req, res, next) => {
  try {
    const { approved, remarks } = req.body;
    let capa = await Capa.findById(req.params.id).populate('responsiblePerson');

    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA record not found' });
    }

    if (approved) {
      capa.status = 'Verified';
      capa.verificationRemarks = remarks || 'Corrective actions verified effective on site.';
      capa.verifiedBy = req.user._id;
      capa.verifiedDate = new Date();
      await capa.save();

      // Update related finding
      await Finding.findByIdAndUpdate(capa.finding, { status: 'Resolved' });

      await createNotification({
        userId: capa.responsiblePerson?._id,
        type: 'CAPA_VERIFIED',
        title: 'CAPA Approved and Verified',
        message: `Your CAPA ${capa.capaCode} has been approved and verified by compliance.`,
        relatedEntity: 'Capa',
        entityId: capa._id
      });

      await logAuditEvent({
        req,
        action: 'VERIFY',
        entityType: 'Capa',
        entityId: capa._id,
        entityCode: capa.capaCode,
        description: `CAPA ${capa.capaCode} verified and approved.`
      });
    } else {
      capa.status = 'In Progress';
      capa.progressPercentage = 80;
      capa.rejectionRemarks = remarks || 'Verification failed. Additional containment evidence required.';
      await capa.save();

      // Update related finding back to In Progress
      await Finding.findByIdAndUpdate(capa.finding, { status: 'In Progress' });

      await createNotification({
        userId: capa.responsiblePerson?._id,
        type: 'CAPA_REJECTED',
        title: 'CAPA Verification Rejected',
        message: `CAPA ${capa.capaCode} was rejected with remarks: ${remarks}. Please revise and re-submit.`,
        relatedEntity: 'Capa',
        entityId: capa._id
      });

      await logAuditEvent({
        req,
        action: 'REJECT',
        entityType: 'Capa',
        entityId: capa._id,
        entityCode: capa.capaCode,
        description: `CAPA ${capa.capaCode} verification rejected: ${remarks}`
      });
    }

    res.status(200).json({
      success: true,
      message: approved ? 'CAPA successfully verified' : 'CAPA rejected and returned to In Progress',
      data: capa
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Close verified CAPA
// @route   POST /api/capa/:id/close
// @access  Private (Compliance Officer / Admin)
exports.closeCapa = async (req, res, next) => {
  try {
    let capa = await Capa.findById(req.params.id);
    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA record not found' });
    }

    if (capa.status !== 'Verified') {
      return res.status(400).json({
        success: false,
        message: 'CAPA must be in Verified status before it can be closed.'
      });
    }

    capa.status = 'Closed';
    capa.closedDate = new Date();
    await capa.save();

    // Auto-close associated finding
    await Finding.findByIdAndUpdate(capa.finding, {
      status: 'Closed',
      closedBy: req.user._id,
      closedDate: new Date(),
      resolutionRemarks: 'Closed after successful CAPA verification.'
    });

    await logAuditEvent({
      req,
      action: 'CLOSE',
      entityType: 'Capa',
      entityId: capa._id,
      entityCode: capa.capaCode,
      description: `CAPA ${capa.capaCode} and associated finding officially closed.`
    });

    res.status(200).json({
      success: true,
      message: 'CAPA and associated finding successfully closed',
      data: capa
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add comment to CAPA
// @route   POST /api/capa/:id/comments
// @access  Private
exports.addCapaComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide comment text' });
    }

    const capa = await Capa.findById(req.params.id);
    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA not found' });
    }

    capa.comments.push({
      user: req.user._id,
      text,
      createdAt: new Date()
    });

    await capa.save();

    const updated = await Capa.findById(req.params.id).populate('comments.user', 'name role avatar');

    res.status(200).json({ success: true, data: updated.comments });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload evidence to CAPA
// @route   POST /api/capa/:id/evidence
// @access  Private
exports.uploadCapaEvidence = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an evidence file' });
    }

    const capa = await Capa.findById(req.params.id);
    if (!capa) {
      return res.status(404).json({ success: false, message: 'CAPA not found' });
    }

    const evidence = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedAt: new Date()
    };

    capa.evidenceFiles.push(evidence);
    await capa.save();

    await logAuditEvent({
      req,
      action: 'EVIDENCE_UPLOAD',
      entityType: 'Capa',
      entityId: capa._id,
      entityCode: capa.capaCode,
      description: `Uploaded evidence for CAPA ${capa.capaCode}: ${req.file.originalname}`
    });

    res.status(200).json({ success: true, data: capa, uploadedFile: evidence });
  } catch (err) {
    next(err);
  }
};
