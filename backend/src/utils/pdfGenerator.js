const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateAuditReportPDF = ({
  report,
  audit,
  site,
  inspection,
  findings = [],
  capas = [],
  outputPath
}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // --- Header Banner ---
      doc.rect(40, 40, 515, 60).fill('#0f766e'); // deep teal
      doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
        .text('ENVIRONMENTAL AUDIT & COMPLIANCE REPORT', 55, 55);
      doc.fontSize(10).font('Helvetica')
        .text('Centralized Environmental Audit Management System (CEAMS)', 55, 78);

      doc.fillColor('#1f2937'); // dark gray
      let y = 120;

      // --- Metadata Grid ---
      doc.rect(40, y, 515, 80).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#0f766e').fontSize(11).font('Helvetica-Bold')
        .text('DOCUMENT & AUDIT METADATA', 50, y + 10);

      doc.fillColor('#334155').fontSize(9).font('Helvetica');
      doc.text(`Report Code: ${report.reportCode || 'N/A'}`, 50, y + 30);
      doc.text(`Audit Code: ${audit ? audit.auditCode : 'N/A'}`, 50, y + 45);
      doc.text(`Audit Title: ${audit ? audit.title : report.title}`, 50, y + 60);

      doc.text(`Facility / Site: ${site ? `${site.name} (${site.siteCode})` : 'N/A'}`, 300, y + 30);
      doc.text(`Industry Type: ${site ? site.industryType : 'General'}`, 300, y + 45);
      doc.text(`Generated On: ${new Date(report.generationDate || Date.now()).toLocaleDateString()}`, 300, y + 60);

      y += 95;

      // --- Executive Summary ---
      doc.fillColor('#0f766e').fontSize(12).font('Helvetica-Bold')
        .text('1. Executive Summary & Objective', 40, y);
      y += 18;
      doc.fillColor('#334155').fontSize(9).font('Helvetica')
        .text(
          report.executiveSummary ||
          (audit && audit.objectives) ||
          'Comprehensive environmental audit conducted to evaluate compliance with applicable statutory environmental statutes, air quality benchmarks, effluent discharge requirements, and waste handling protocols.',
          40,
          y,
          { width: 515, align: 'justify' }
        );
      y += 45;

      // --- Compliance Scorecard ---
      doc.fillColor('#0f766e').fontSize(12).font('Helvetica-Bold')
        .text('2. Compliance Scorecard & Metric Breakdown', 40, y);
      y += 18;

      const score = report.metricsSnapshot?.compliancePercentage || (audit ? audit.complianceScore : 0);
      const scoreColor = score >= 85 ? '#16a34a' : score >= 70 ? '#d97706' : '#dc2626';

      doc.rect(40, y, 150, 60).fillAndStroke('#f0fdf4', '#86efac');
      doc.fillColor(scoreColor).fontSize(24).font('Helvetica-Bold')
        .text(`${score}%`, 50, y + 12);
      doc.fillColor('#166534').fontSize(8).font('Helvetica')
        .text('Overall Compliance Rating', 50, y + 40);

      const m = report.metricsSnapshot || {};
      doc.rect(200, y, 355, 60).fillAndStroke('#f8fafc', '#cbd5e1');
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica');
      doc.text(`• Total Findings Logged: ${m.totalFindings || findings.length}`, 215, y + 10);
      doc.text(`• Critical / High Severity: ${(m.criticalFindings || 0) + (m.highFindings || 0)}`, 215, y + 25);
      doc.text(`• Open / Pending CAPA Actions: ${(m.totalCapa || capas.length) - (m.closedCapa || 0)}`, 215, y + 40);

      doc.text(`• Closed / Verified Actions: ${m.closedCapa || 0}`, 380, y + 10);
      doc.text(`• Overdue Items: ${m.overdueCapa || 0}`, 380, y + 25);
      doc.text(`• Inspection Result: ${m.overallEvaluation || (inspection ? inspection.overallResult : 'Completed')}`, 380, y + 40);

      y += 75;

      // --- Findings Section ---
      doc.fillColor('#0f766e').fontSize(12).font('Helvetica-Bold')
        .text('3. Key Environmental Findings & Non-Conformances', 40, y);
      y += 18;

      if (findings.length === 0) {
        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Oblique')
          .text('No non-conformances or environmental findings were recorded for this audit scope.', 40, y);
        y += 20;
      } else {
        findings.slice(0, 5).forEach((f, idx) => {
          if (y > 700) {
            doc.addPage();
            y = 40;
          }
          const sevColor = f.severity === 'Critical' ? '#ef4444' : f.severity === 'High' ? '#f97316' : '#3b82f6';
          doc.rect(40, y, 515, 45).fillAndStroke('#ffffff', '#e2e8f0');
          doc.rect(40, y, 6, 45).fill(sevColor);

          doc.fillColor('#1e293b').fontSize(9).font('Helvetica-Bold')
            .text(`${f.findingCode || `FND-0${idx + 1}`} - ${f.title}`, 55, y + 8);
          doc.fillColor('#64748b').fontSize(8).font('Helvetica')
            .text(`Category: ${f.category} | Severity: ${f.severity} | Status: ${f.status}`, 55, y + 20);
          doc.fillColor('#334155').fontSize(8).font('Helvetica')
            .text(`Ref: ${f.requirementReference || 'Standard EHS Code'} | ${f.description?.substring(0, 80)}...`, 55, y + 31);

          y += 50;
        });
      }

      // --- CAPA Actions Section ---
      if (y > 660) {
        doc.addPage();
        y = 40;
      }
      y += 10;
      doc.fillColor('#0f766e').fontSize(12).font('Helvetica-Bold')
        .text('4. Corrective and Preventive Actions (CAPA) Status', 40, y);
      y += 18;

      if (capas.length === 0) {
        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Oblique')
          .text('No CAPA records currently attached.', 40, y);
        y += 20;
      } else {
        capas.slice(0, 4).forEach((c, idx) => {
          if (y > 700) {
            doc.addPage();
            y = 40;
          }
          doc.rect(40, y, 515, 42).fillAndStroke('#f8fafc', '#e2e8f0');
          doc.fillColor('#1e293b').fontSize(8.5).font('Helvetica-Bold')
            .text(`${c.capaCode || `CAPA-0${idx + 1}`}: ${c.actionTitle}`, 50, y + 6);
          doc.fillColor('#475569').fontSize(8).font('Helvetica')
            .text(`Assignee: ${c.responsiblePerson?.name || 'Site Lead'} | Due: ${c.dueDate ? new Date(c.dueDate).toLocaleDateString() : 'N/A'} | Status: ${c.status} | Progress: ${c.progressPercentage}%`, 50, y + 18);
          doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
            .text(`Corrective: ${c.correctiveAction ? c.correctiveAction.substring(0, 95) : 'Action documented'}...`, 50, y + 29);
          y += 48;
        });
      }

      // --- Recommendations & Sign-off ---
      if (y > 640) {
        doc.addPage();
        y = 40;
      }
      y += 10;
      doc.fillColor('#0f766e').fontSize(12).font('Helvetica-Bold')
        .text('5. Recommendations & Sign-off', 40, y);
      y += 16;
      doc.fillColor('#334155').fontSize(8.5).font('Helvetica')
        .text(
          report.recommendations ||
          'Implement preventative spill barrier inspections and recalibrate VOC continuous emission monitoring system. Submit closure verification prior to quarterly statutory review.',
          40,
          y,
          { width: 515 }
        );

      y += 45;
      // Disclaimer
      doc.rect(40, y, 515, 30).fill('#f1f5f9');
      doc.fillColor('#64748b').fontSize(7.5).font('Helvetica')
        .text(report.statutoryDisclaimer || 'This report is an internal environmental audit compilation.', 45, y + 6, { width: 505 });

      y += 45;
      // Signatures
      doc.fillColor('#1e293b').fontSize(8).font('Helvetica-Bold');
      doc.text('_____________________________', 50, y + 20);
      doc.text('Lead Environmental Auditor', 50, y + 33);

      doc.text('_____________________________', 230, y + 20);
      doc.text('Industrial Site Manager', 230, y + 33);

      doc.text('_____________________________', 410, y + 20);
      doc.text('Chief Compliance Officer', 410, y + 33);

      doc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateAuditReportPDF };
