const Site = require('../models/Site');
const Audit = require('../models/Audit');
const Inspection = require('../models/Inspection');
const Finding = require('../models/Finding');
const Capa = require('../models/Capa');
const Report = require('../models/Report');

// @desc    Get dashboard KPI metrics summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res, next) => {
  try {
    const siteQuery = {};
    if (req.user.role === 'Site Manager' && req.user.assignedSites?.length > 0) {
      siteQuery._id = { $in: req.user.assignedSites };
    }

    const totalSites = await Site.countDocuments(siteQuery);
    const totalAudits = await Audit.countDocuments(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {});
    const scheduledAudits = await Audit.countDocuments({
      status: 'Scheduled',
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });
    const completedAudits = await Audit.countDocuments({
      status: { $in: ['Completed', 'Closed'] },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });
    const inProgressAudits = await Audit.countDocuments({
      status: 'In Progress',
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });

    const openFindings = await Finding.countDocuments({
      status: { $in: ['Open', 'CAPA Assigned', 'In Progress', 'Pending Verification'] },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });
    const criticalFindings = await Finding.countDocuments({
      severity: 'Critical',
      status: { $nin: ['Closed', 'Resolved'] },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });

    const pendingCapa = await Capa.countDocuments({
      status: { $in: ['Open', 'Assigned', 'In Progress', 'Pending Verification'] },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });
    const closedCapa = await Capa.countDocuments({
      status: { $in: ['Verified', 'Closed'] },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });

    const now = new Date();
    const overdueCapa = await Capa.countDocuments({
      dueDate: { $lt: now },
      status: { $nin: ['Verified', 'Closed'] },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    });

    const totalReports = await Report.countDocuments(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {});

    // Overall compliance calculation based on all inspections or completed audits
    const auditsWithScores = await Audit.find({
      complianceScore: { $gt: 0 },
      ...(siteQuery._id ? { site: { $in: req.user.assignedSites } } : {})
    }).select('complianceScore');

    let overallCompliance = 0;
    if (auditsWithScores.length > 0) {
      const sum = auditsWithScores.reduce((acc, curr) => acc + curr.complianceScore, 0);
      overallCompliance = Math.round(sum / auditsWithScores.length);
    } else {
      // If no audits yet, compute from inspections if available
      const inspections = await Inspection.find({}).select('statistics');
      if (inspections.length > 0) {
        const sum = inspections.reduce((acc, curr) => acc + (curr.statistics?.compliancePercentage || 0), 0);
        overallCompliance = Math.round(sum / inspections.length);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalSites,
        totalAudits,
        scheduledAudits,
        completedAudits,
        inProgressAudits,
        openFindings,
        criticalFindings,
        pendingCapa,
        overdueCapa,
        closedCapa,
        overallCompliance,
        totalReports
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get real compliance analytics and chart data
// @route   GET /api/dashboard/analytics
// @access  Private
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Audit Status Distribution
    const auditStatuses = await Audit.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const auditStatusDistribution = auditStatuses.map((s) => ({
      name: s._id,
      value: s.count
    }));

    // 2. Findings by Severity
    const severityCounts = await Finding.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const severities = ['Critical', 'High', 'Medium', 'Low'];
    const findingsBySeverity = severities.map((sev) => {
      const found = severityCounts.find((s) => s._id === sev);
      return {
        severity: sev,
        count: found ? found.count : 0
      };
    });

    // 3. CAPA Status Distribution
    const capaStatuses = await Capa.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const capaStatusDistribution = capaStatuses.map((s) => ({
      name: s._id,
      value: s.count
    }));

    // 4. CAPA Overdue vs On-Time
    const now = new Date();
    const activeCapas = await Capa.find({ status: { $nin: ['Verified', 'Closed'] } }).select('dueDate');
    let overdueCount = 0;
    let onTimeCount = 0;
    activeCapas.forEach((c) => {
      if (new Date(c.dueDate) < now) overdueCount++;
      else onTimeCount++;
    });
    const capaTimelineDistribution = [
      { name: 'On-Time', value: onTimeCount },
      { name: 'Overdue', value: overdueCount }
    ];

    // 5. Compliance by Site
    const sites = await Site.find({ status: 'Active' }).limit(7);
    const complianceBySite = await Promise.all(
      sites.map(async (s) => {
        const audits = await Audit.find({ site: s._id, complianceScore: { $gt: 0 } }).select('complianceScore');
        let score = 90;
        if (audits.length > 0) {
          const sum = audits.reduce((acc, curr) => acc + curr.complianceScore, 0);
          score = Math.round(sum / audits.length);
        }
        return {
          siteName: s.name,
          siteCode: s.siteCode,
          complianceScore: score
        };
      })
    );

    // 6. Audit & Finding Monthly Trend (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth();
      const monthStart = new Date(mYear, mMonth, 1);
      const monthEnd = new Date(mYear, mMonth + 1, 0, 23, 59, 59);

      const auditCount = await Audit.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const findingCount = await Finding.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      const capaClosureCount = await Capa.countDocuments({
        status: { $in: ['Verified', 'Closed'] },
        updatedAt: { $gte: monthStart, $lte: monthEnd }
      });

      trendData.push({
        month: monthNames[mMonth],
        audits: auditCount,
        findings: findingCount,
        closedCapa: capaClosureCount
      });
    }

    // 7. Recent audits & findings
    const recentAudits = await Audit.find()
      .populate('site', 'name siteCode')
      .populate('leadAuditor', 'name')
      .sort({ scheduledDate: -1 })
      .limit(5);

    const recentFindings = await Finding.find()
      .populate('site', 'name siteCode')
      .populate('audit', 'auditCode title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        auditStatusDistribution,
        findingsBySeverity,
        capaStatusDistribution,
        capaTimelineDistribution,
        complianceBySite,
        trendData,
        recentAudits,
        recentFindings
      }
    });
  } catch (err) {
    next(err);
  }
};
