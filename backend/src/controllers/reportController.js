const path = require('path');
const fs = require('fs');
const Report = require('../models/Report');
const Audit = require('../models/Audit');
const Site = require('../models/Site');
const Inspection = require('../models/Inspection');
const Finding = require('../models/Finding');
const Capa = require('../models/Capa');
const { generateAuditReportPDF } = require('../utils/pdfGenerator');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get all generated reports with pagination and filters
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', reportType = '', site = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { reportCode: { $regex: search, $options: 'i' } }
      ];
    }
    if (reportType) query.reportType = reportType;
    if (site) query.site = site;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('site', 'name siteCode location')
      .populate('audit', 'auditCode title status')
      .populate('generatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: reports,
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

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('site')
      .populate('audit')
      .populate('inspection')
      .populate('generatedBy', 'name email department');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report record not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
};

// @desc    Generate report from stored audit, inspection, finding and CAPA data + produce PDF
// @route   POST /api/reports/generate
// @access  Private
exports.generateReport = async (req, res, next) => {
  try {
    const {
      title,
      reportType,
      siteId,
      auditId,
      executiveSummary,
      recommendations,
      periodStart,
      periodEnd
    } = req.body;

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found' });
    }

    let audit = null;
    let inspection = null;
    if (auditId) {
      audit = await Audit.findById(auditId).populate('leadAuditor', 'name email');
      inspection = await Inspection.findOne({ audit: auditId }).populate('checklist');
    }

    const findingQuery = auditId ? { audit: auditId } : { site: siteId };
    const findings = await Finding.find(findingQuery);

    const capaQuery = auditId ? { audit: auditId } : { site: siteId };
    const capas = await Capa.find(capaQuery).populate('responsiblePerson', 'name email');

    // Calculate metrics
    const criticalFindings = findings.filter((f) => f.severity === 'Critical').length;
    const highFindings = findings.filter((f) => f.severity === 'High').length;
    const mediumFindings = findings.filter((f) => f.severity === 'Medium').length;
    const lowFindings = findings.filter((f) => f.severity === 'Low').length;

    const closedCapa = capas.filter((c) => c.status === 'Closed' || c.status === 'Verified').length;
    const overdueCapa = capas.filter(
      (c) => !['Verified', 'Closed'].includes(c.status) && new Date(c.dueDate) < new Date()
    ).length;

    const complianceScore = inspection?.statistics?.compliancePercentage || audit?.complianceScore || 85;

    const count = await Report.countDocuments();
    const year = new Date().getFullYear();
    const reportCode = `REP-${year}-${String(count + 1).padStart(3, '0')}`;
    const pdfFileName = `${reportCode}_${Date.now()}.pdf`;
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const pdfFilePath = path.join(uploadsDir, pdfFileName);

    const report = new Report({
      reportCode,
      title: title || `${reportType || 'Environmental Audit Report'} - ${site.name}`,
      reportType: reportType || 'Environmental Audit Report',
      site: site._id,
      audit: audit ? audit._id : null,
      inspection: inspection ? inspection._id : null,
      generatedBy: req.user._id,
      generationDate: new Date(),
      periodStart,
      periodEnd,
      executiveSummary,
      complianceScore,
      metricsSnapshot: {
        totalFindings: findings.length,
        criticalFindings,
        highFindings,
        mediumFindings,
        lowFindings,
        totalCapa: capas.length,
        closedCapa,
        overdueCapa,
        compliancePercentage: complianceScore,
        overallEvaluation: complianceScore >= 85 ? 'High Compliance' : complianceScore >= 70 ? 'Moderate Compliance' : 'Low Compliance / Action Required'
      },
      recommendations,
      pdfFileName,
      pdfFilePath: `/uploads/${pdfFileName}`
    });

    // Generate real PDF
    await generateAuditReportPDF({
      report,
      audit,
      site,
      inspection,
      findings,
      capas,
      outputPath: pdfFilePath
    });

    await report.save();

    await logAuditEvent({
      req,
      action: 'REPORT_GENERATION',
      entityType: 'Report',
      entityId: report._id,
      entityCode: report.reportCode,
      description: `Generated ${report.reportType} (${report.reportCode}) with compliance score ${complianceScore}%`
    });

    res.status(201).json({
      success: true,
      message: 'Report compiled and PDF generated successfully',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download generated PDF report
// @route   GET /api/reports/:id/download
// @access  Private
exports.downloadReportPdf = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.pdfFileName) {
      return res.status(404).json({ success: false, message: 'PDF document not found for this report' });
    }

    const filePath = path.join(__dirname, '../../uploads', report.pdfFileName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file is not present on disk' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.pdfFileName}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
};
