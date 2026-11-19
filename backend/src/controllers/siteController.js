const Site = require('../models/Site');
const Audit = require('../models/Audit');
const Finding = require('../models/Finding');
const Capa = require('../models/Capa');
const AuditLog = require('../models/AuditLog');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all sites with search, filters & pagination
// @route   GET /api/sites
// @access  Private
exports.getSites = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', industryType = '', status = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { siteCode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }
    if (industryType) query.industryType = industryType;
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Site.countDocuments(query);
    const sites = await Site.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate quick stats for each site
    const sitesWithStats = await Promise.all(
      sites.map(async (site) => {
        const auditCount = await Audit.countDocuments({ site: site._id });
        const openFindingsCount = await Finding.countDocuments({
          site: site._id,
          status: { $in: ['Open', 'CAPA Assigned', 'In Progress', 'Pending Verification'] }
        });
        const openCapaCount = await Capa.countDocuments({
          site: site._id,
          status: { $nin: ['Verified', 'Closed'] }
        });

        // Compute average compliance score from completed audits
        const completedAudits = await Audit.find({ site: site._id, complianceScore: { $gt: 0 } }).select('complianceScore');
        let avgCompliance = 90;
        if (completedAudits.length > 0) {
          const sum = completedAudits.reduce((acc, curr) => acc + (curr.complianceScore || 0), 0);
          avgCompliance = Math.round(sum / completedAudits.length);
        }

        return {
          ...site.toObject(),
          stats: {
            auditCount,
            openFindingsCount,
            openCapaCount,
            complianceScore: avgCompliance
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: sitesWithStats,
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

// @desc    Get single site with comprehensive dashboard information
// @route   GET /api/sites/:id
// @access  Private
exports.getSiteById = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Industrial site not found' });
    }

    // Related collections data
    const upcomingAudits = await Audit.find({
      site: site._id,
      status: { $in: ['Scheduled', 'In Progress'] }
    })
      .populate('leadAuditor', 'name email')
      .sort({ scheduledDate: 1 })
      .limit(5);

    const completedAudits = await Audit.find({
      site: site._id,
      status: { $in: ['Completed', 'Closed'] }
    })
      .populate('leadAuditor', 'name email')
      .sort({ endDate: -1 })
      .limit(5);

    const openFindings = await Finding.find({
      site: site._id,
      status: { $in: ['Open', 'CAPA Assigned', 'In Progress', 'Pending Verification'] }
    })
      .populate('audit', 'auditCode title')
      .sort({ createdAt: -1 })
      .limit(5);

    const openCapas = await Capa.find({
      site: site._id,
      status: { $nin: ['Verified', 'Closed'] }
    })
      .populate('responsiblePerson', 'name email')
      .sort({ dueDate: 1 })
      .limit(5);

    const now = new Date();
    const overdueCapaCount = await Capa.countDocuments({
      site: site._id,
      status: { $nin: ['Verified', 'Closed'] },
      dueDate: { $lt: now }
    });

    const recentActivities = await AuditLog.find({
      $or: [{ entityId: site._id }, { 'details.siteId': site._id }]
    })
      .sort({ timestamp: -1 })
      .limit(10);

    // Compute site compliance percentage
    const allAudits = await Audit.find({ site: site._id, complianceScore: { $gt: 0 } });
    let complianceScore = 88; // sensible default for active site
    if (allAudits.length > 0) {
      const sum = allAudits.reduce((acc, curr) => acc + (curr.complianceScore || 0), 0);
      complianceScore = Math.round(sum / allAudits.length);
    }

    res.status(200).json({
      success: true,
      data: {
        site,
        complianceScore,
        upcomingAudits,
        completedAudits,
        openFindings,
        openCapas,
        overdueCapaCount,
        recentActivities
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new site
// @route   POST /api/sites
// @access  Private (Admin)
exports.createSite = async (req, res, next) => {
  try {
    const {
      siteCode,
      name,
      industryType,
      location,
      address,
      city,
      state,
      country,
      contactPerson,
      contactEmail,
      contactPhone,
      status,
      environmentalClearanceNumber
    } = req.body;

    const existing = await Site.findOne({ siteCode: siteCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Site code ${siteCode} is already in use` });
    }

    const site = await Site.create({
      siteCode: siteCode.toUpperCase(),
      name,
      industryType,
      location,
      address,
      city,
      state,
      country: country || 'United States',
      contactPerson,
      contactEmail,
      contactPhone,
      status: status || 'Active',
      environmentalClearanceNumber,
      createdBy: req.user._id
    });

    await logAuditEvent({
      req,
      action: 'CREATE',
      entityType: 'Site',
      entityId: site._id,
      entityCode: site.siteCode,
      description: `Created new industrial site: ${site.name} (${site.siteCode})`
    });

    res.status(201).json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
};

// @desc    Update site
// @route   PUT /api/sites/:id
// @access  Private (Admin)
exports.updateSite = async (req, res, next) => {
  try {
    let site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    const oldStatus = site.status;
    site = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await logAuditEvent({
      req,
      action: oldStatus !== site.status ? 'STATUS_CHANGE' : 'UPDATE',
      entityType: 'Site',
      entityId: site._id,
      entityCode: site.siteCode,
      description: `Updated site details for ${site.name}`,
      details: { previousStatus: oldStatus, newStatus: site.status }
    });

    res.status(200).json({ success: true, data: site });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete site
// @route   DELETE /api/sites/:id
// @access  Private (Admin)
exports.deleteSite = async (req, res, next) => {
  try {
    const site = await Site.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    await Site.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      req,
      action: 'DELETE',
      entityType: 'Site',
      entityId: site._id,
      entityCode: site.siteCode,
      description: `Deleted industrial site: ${site.name} (${site.siteCode})`
    });

    res.status(200).json({ success: true, message: 'Site deleted successfully' });
  } catch (err) {
    next(err);
  }
};
