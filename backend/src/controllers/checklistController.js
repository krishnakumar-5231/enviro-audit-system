const Checklist = require('../models/Checklist');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all checklists
// @route   GET /api/checklists
// @access  Private
exports.getChecklists = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { checklistCode: { $regex: search, $options: 'i' } },
        { industryType: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Checklist.countDocuments(query);
    const checklists = await Checklist.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: checklists,
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

// @desc    Get single checklist
// @route   GET /api/checklists/:id
// @access  Private
exports.getChecklistById = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id).populate('createdBy', 'name email');
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist template not found' });
    }
    res.status(200).json({ success: true, data: checklist });
  } catch (err) {
    next(err);
  }
};

// @desc    Create checklist
// @route   POST /api/checklists
// @access  Private (Admin / Auditor)
exports.createChecklist = async (req, res, next) => {
  try {
    const { checklistCode, title, description, version, industryType, categories, questions, status } = req.body;

    const existing = await Checklist.findOne({ checklistCode: checklistCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Checklist code ${checklistCode} already exists` });
    }

    const checklist = await Checklist.create({
      checklistCode: checklistCode.toUpperCase(),
      title,
      description,
      version: version || '1.0',
      industryType: industryType || 'General Industrial',
      categories: categories || [],
      questions: questions || [],
      status: status || 'Active',
      createdBy: req.user._id
    });

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'Checklist',
      entityId: checklist._id,
      entityCode: checklist.checklistCode,
      description: `Created checklist template: ${checklist.title} (${checklist.questions.length} questions)`
    });

    res.status(201).json({ success: true, data: checklist });
  } catch (err) {
    next(err);
  }
};

// @desc    Update checklist
// @route   PUT /api/checklists/:id
// @access  Private (Admin / Auditor)
exports.updateChecklist = async (req, res, next) => {
  try {
    let checklist = await Checklist.findById(req.params.id);
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    checklist = await Checklist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await logAuditEvent({
      req,
      action: 'UPDATE',
      entityType: 'Checklist',
      entityId: checklist._id,
      entityCode: checklist.checklistCode,
      description: `Updated checklist template: ${checklist.title} (v${checklist.version})`
    });

    res.status(200).json({ success: true, data: checklist });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete checklist
// @route   DELETE /api/checklists/:id
// @access  Private (Admin)
exports.deleteChecklist = async (req, res, next) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) {
      return res.status(404).json({ success: false, message: 'Checklist not found' });
    }

    await Checklist.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      req,
      action: 'DELETE',
      entityType: 'Checklist',
      entityId: checklist._id,
      entityCode: checklist.checklistCode,
      description: `Deleted checklist: ${checklist.title}`
    });

    res.status(200).json({ success: true, message: 'Checklist deleted successfully' });
  } catch (err) {
    next(err);
  }
};
