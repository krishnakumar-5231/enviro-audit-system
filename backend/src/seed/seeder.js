const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Site = require('../models/Site');
const Checklist = require('../models/Checklist');
const Audit = require('../models/Audit');
const Inspection = require('../models/Inspection');
const Finding = require('../models/Finding');
const Capa = require('../models/Capa');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');

const { seedUsers, seedSites, seedChecklist } = require('./seedData');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/enviro_audit_db';
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
    }
    console.log(`\n======================================================`);
    console.log(`Connected to MongoDB for Seeding: ${mongoose.connection.host || mongoUri}`);

    // Clear existing records
    await User.deleteMany({});
    await Site.deleteMany({});
    await Checklist.deleteMany({});
    await Audit.deleteMany({});
    await Inspection.deleteMany({});
    await Finding.deleteMany({});
    await Capa.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Setting.deleteMany({});

    console.log('✓ Collections cleared successfully.');

    // 1. Seed Users
    const createdUsers = [];
    for (const u of seedUsers) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`✓ Seeded ${createdUsers.length} Users (Admin, Auditor, Site Manager, Compliance Officer)`);

    const adminUser = createdUsers.find((u) => u.role === 'Administrator');
    const auditorUser = createdUsers.find((u) => u.role === 'Environmental Auditor');
    const managerUser = createdUsers.find((u) => u.role === 'Site Manager');
    const complianceUser = createdUsers.find((u) => u.role === 'Compliance Officer');

    // 2. Seed Sites
    const createdSites = [];
    for (const s of seedSites) {
      const site = await Site.create({
        ...s,
        createdBy: adminUser._id
      });
      createdSites.push(site);
    }
    console.log(`✓ Seeded ${createdSites.length} Industrial Sites`);

    // Assign sites to Site Manager
    managerUser.assignedSites = [createdSites[0]._id, createdSites[1]._id];
    await managerUser.save();

    // 3. Seed Master Checklist
    const checklist = await Checklist.create({
      ...seedChecklist,
      createdBy: adminUser._id
    });
    console.log(`✓ Seeded Master Checklist "${checklist.title}" with ${checklist.questions.length} questions`);

    // 4. Seed Audits (8 Audits across sites with varying statuses)
    const auditData = [
      {
        auditCode: 'AUD-2026-001',
        site: createdSites[0]._id, // Apex
        title: 'Q1 Comprehensive Environmental Statutory Audit',
        auditType: 'Compliance Audit',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        status: 'Completed',
        priority: 'Critical',
        scope: 'Air emissions, ETP wastewater discharge, and hazardous chemical drum storage areas.',
        complianceScore: 82,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-002',
        site: createdSites[1]._id, // Greenfield Steel
        title: 'Air Emissions & CEMS Verification Audit',
        auditType: 'Internal Environmental Audit',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        status: 'Under Review',
        priority: 'High',
        scope: 'Blast furnace baghouses, flue gas scrubbing, and continuous emissions monitors.',
        complianceScore: 78,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-003',
        site: createdSites[2]._id, // Cascade Pharma
        title: 'RCRA Hazardous Solvent Handling Inspection',
        auditType: 'Site Inspection',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        priority: 'High',
        scope: 'API synthesis cleanrooms, solvent recovery stills, and satellite accumulation points.',
        complianceScore: 88,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-004',
        site: createdSites[3]._id, // Evergreen Agro
        title: 'Annual Spill Prevention & SPCC Containment Audit',
        auditType: 'Compliance Audit',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        priority: 'Medium',
        scope: 'Bulk ammonia and pesticide storage bulk tanks, diked berms, and retention basins.',
        complianceScore: 0,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-005',
        site: createdSites[0]._id, // Apex
        title: 'Wastewater Treatment Plant (ETP) Parameter Audit',
        auditType: 'Periodic Audit',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        startDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000),
        status: 'Closed',
        priority: 'High',
        scope: 'Biological aeration basins, clarifiers, and NPDES Outfall 001 analytical logs.',
        complianceScore: 94,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-006',
        site: createdSites[1]._id, // Greenfield Steel
        title: 'Stormwater Runoff & Discharge Gate Inspection',
        auditType: 'Site Inspection',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        priority: 'Low',
        scope: 'Perimeter ditch drainage interceptors and silt collection retention reservoirs.',
        complianceScore: 0,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-007',
        site: createdSites[2]._id, // Cascade Pharma
        title: 'Statutory Permitting & DMR Verification Review',
        auditType: 'Internal Environmental Audit',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        priority: 'Medium',
        scope: 'Title V renewals, EPA electronic reporting CDX logs, and chemical manifest binders.',
        complianceScore: 0,
        checklist: checklist._id,
        createdBy: adminUser._id
      },
      {
        auditCode: 'AUD-2026-008',
        site: createdSites[3]._id, // Evergreen Agro
        title: 'Post-Closure Corrective Action Follow-up Audit',
        auditType: 'Follow-up Audit',
        leadAuditor: auditorUser._id,
        scheduledDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'Scheduled',
        priority: 'High',
        scope: 'Verification of newly installed vapor recovery scrubbers and containment valves.',
        complianceScore: 0,
        checklist: checklist._id,
        createdBy: adminUser._id
      }
    ];

    const createdAudits = await Audit.insertMany(auditData);
    console.log(`✓ Seeded ${createdAudits.length} Audits across multiple statuses`);

    // 5. Seed Inspection for AUD-2026-001 (Completed Audit)
    const inspItems = checklist.questions.map((q, idx) => {
      let resp = 'Compliant';
      let obs = 'Compliant with documented evidence and inspection records.';

      // Make a couple items Non-Compliant and Partially Compliant to show realistic findings
      if (q.questionId === 'Q-HAZ-01') {
        resp = 'Non-Compliant';
        obs = 'Hairline cracking observed in concrete secondary containment berm of Drum Staging Area B. Minor oily residue accumulated.';
      } else if (q.questionId === 'Q-AIR-02') {
        resp = 'Partially Compliant';
        obs = 'Quarterly LDAR monitoring performed; however, two pump seals were past the 15-day initial repair attempt window.';
      } else if (q.questionId === 'Q-SPL-02') {
        resp = 'Partially Compliant';
        obs = 'Chemical spill cart 3 missing 2 bags of absorbent neutralizer. Restock requisition was delayed.';
      }

      return {
        questionId: q.questionId,
        category: q.category,
        questionText: q.questionText,
        requirementReference: q.requirementReference,
        riskLevel: q.riskLevel,
        response: resp,
        observation: obs,
        remarks: 'Inspected on site during active plant operation.',
        evidenceFiles: [],
        findingCreated: resp !== 'Compliant'
      };
    });

    const inspection1 = new Inspection({
      inspectionCode: 'INSP-2026-001',
      audit: createdAudits[0]._id,
      site: createdSites[0]._id,
      inspector: auditorUser._id,
      checklist: checklist._id,
      inspectionCategory: 'Comprehensive Environmental Inspection',
      status: 'Submitted',
      items: inspItems,
      remarks: 'Overall high standard of compliance; containment repairs and LDAR tag rechecks required.',
      submittedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000)
    });
    inspection1.calculateStatistics();
    await inspection1.save();

    // Also seed inspection for AUD-2026-003 (In Progress)
    const inspection2 = new Inspection({
      inspectionCode: 'INSP-2026-002',
      audit: createdAudits[2]._id,
      site: createdSites[2]._id,
      inspector: auditorUser._id,
      checklist: checklist._id,
      status: 'In Progress',
      items: inspItems.map((item) => ({ ...item, response: item.questionId.startsWith('Q-AIR') ? 'Compliant' : 'Pending' })),
      remarks: 'Inspection currently underway in cleanroom solvent recovery modules.'
    });
    inspection2.calculateStatistics();
    await inspection2.save();

    console.log(`✓ Seeded Digital Inspections with calculated compliance statistics`);

    // 6. Seed Findings / Non-Conformances
    const findingsData = [
      {
        findingCode: 'FND-2026-001',
        audit: createdAudits[0]._id,
        inspection: inspection1._id,
        site: createdSites[0]._id,
        checklistQuestionId: 'Q-HAZ-01',
        checklistItemQuestion: 'Secondary Containment Integrity for Chemical Storage',
        title: 'Cracked Secondary Containment Berm in Chemical Drum Area B',
        description: 'Physical inspection revealed a 4-foot hairline fissure in the epoxy-coated concrete secondary containment dike surrounding hazardous solvent drums in Staging Area B.',
        category: 'Hazardous Waste Management',
        severity: 'Critical',
        priority: 'Urgent',
        requirementReference: '40 CFR 264.175 Secondary Containment Regulations',
        status: 'Closed',
        resolutionRemarks: 'Berm injected with chemical-resistant polyurea resin; leak tightness certified by structural engineer.',
        createdBy: auditorUser._id,
        closedBy: complianceUser._id,
        closedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        findingCode: 'FND-2026-002',
        audit: createdAudits[0]._id,
        inspection: inspection1._id,
        site: createdSites[0]._id,
        checklistQuestionId: 'Q-AIR-02',
        checklistItemQuestion: 'VOC Leak Detection and Repair (LDAR) Schedule',
        title: 'Delayed LDAR First-Attempt Repair on Flange F-204',
        description: 'Two organic vapor flange connections in the fractionation unit were flagged with fugitive emissions > 500 ppm but lacked first-attempt repair tags within the mandatory 5-day window.',
        category: 'Air Quality & Emissions',
        severity: 'High',
        priority: 'High',
        requirementReference: '40 CFR Part 63 Subpart H',
        status: 'In Progress',
        createdBy: auditorUser._id
      },
      {
        findingCode: 'FND-2026-003',
        audit: createdAudits[1]._id,
        site: createdSites[1]._id,
        title: 'Baghouse Differential Pressure Sensor Drift',
        description: 'Magnehelic differential pressure gauge on Baghouse 02 showed inconsistent differential pressure reading indicating potential sensor line clogging or filter bag blinding.',
        category: 'Air Quality & Emissions',
        severity: 'Medium',
        priority: 'Medium',
        requirementReference: 'State SIP Dust Rule 401',
        status: 'Pending Verification',
        createdBy: auditorUser._id
      },
      {
        findingCode: 'FND-2026-004',
        audit: createdAudits[0]._id,
        inspection: inspection1._id,
        site: createdSites[0]._id,
        checklistQuestionId: 'Q-SPL-02',
        checklistItemQuestion: 'Emergency Spill Response Kit Restock',
        title: 'Depleted Neutralizer Absorbents in Spill Kit 3',
        description: 'Acid/alkali neutralizer containers in Mobile Spill Cart #3 at the chemical transfer dock were empty following a minor forklift splash incident.',
        category: 'Spill Prevention & Control',
        severity: 'Low',
        priority: 'Medium',
        requirementReference: 'Facility Integrated Contingency Plan Sec 7',
        status: 'Resolved',
        createdBy: auditorUser._id
      },
      {
        findingCode: 'FND-2026-005',
        audit: createdAudits[2]._id,
        site: createdSites[2]._id,
        title: 'Unlabeled Hazardous Solvent Waste Carboy',
        description: 'A 20-liter satellite accumulation container in QC laboratory 3 was missing the mandatory GHS toxic hazard pictogram and accumulation start date.',
        category: 'Hazardous Waste Management',
        severity: 'High',
        priority: 'High',
        requirementReference: '40 CFR 262.15 Satellite Accumulation Area Standards',
        status: 'Open',
        createdBy: auditorUser._id
      }
    ];

    const createdFindings = await Finding.insertMany(findingsData);
    console.log(`✓ Seeded ${createdFindings.length} Environmental Findings with varied severities`);

    // 7. Seed CAPA Actions across all workflow states
    const capaData = [
      {
        capaCode: 'CAPA-2026-001',
        finding: createdFindings[0]._id,
        audit: createdAudits[0]._id,
        site: createdSites[0]._id,
        actionTitle: 'Structural Resurfacing & Sealing of Chemical Drum Berm B',
        problemStatement: 'Crack in secondary containment allows potential hazardous solvent percolation into subsoil.',
        rootCause: 'Thermal contraction and heavy forklift vibration against unreinforced concrete curb joint.',
        correctiveAction: 'Excavated damaged concrete fissure, injected elastomeric polyurethane resin sealant, and applied chemical-resistant epoxy liner.',
        preventiveAction: 'Installed heavy-duty yellow steel wheel guardrails 18 inches off the containment berm to prevent forklift impact.',
        responsiblePerson: managerUser._id,
        assignedDepartment: 'Civil Maintenance & EHS',
        priority: 'Urgent',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'Closed',
        progressPercentage: 100,
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        verifiedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        closedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        verifiedBy: complianceUser._id,
        verificationRemarks: 'Hydrostatic containment test held water for 24 hours without leakage. Workmanship verified compliant.',
        createdBy: auditorUser._id
      },
      {
        capaCode: 'CAPA-2026-002',
        finding: createdFindings[1]._id,
        audit: createdAudits[0]._id,
        site: createdSites[0]._id,
        actionTitle: 'LDAR Protocol Retraining & Valve Packing Replacement',
        problemStatement: 'Fugitive emissions on fractionation flanges delayed past 5-day repair requirement.',
        rootCause: 'Shortage of high-temperature graphite spiral-wound replacement gaskets in local maintenance stockroom.',
        correctiveAction: 'Re-torqued flange bolts and installed new certified low-leak packing on valve stems.',
        preventiveAction: 'Established safety stock minimum inventory of 20 high-temp gasket sets in ERP automated reordering system.',
        responsiblePerson: managerUser._id,
        assignedDepartment: 'Mechanical Integrity',
        priority: 'High',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'In Progress',
        progressPercentage: 65,
        createdBy: auditorUser._id
      },
      {
        capaCode: 'CAPA-2026-003',
        finding: createdFindings[2]._id,
        audit: createdAudits[1]._id,
        site: createdSites[1]._id,
        actionTitle: 'Baghouse Pressure Sensor Recalibration and Purge Line Installation',
        problemStatement: 'Differential pressure sensor line clogged with steel particulate dust.',
        rootCause: 'Dust cake accumulation inside impulse tubing due to lack of periodic reverse air purges.',
        correctiveAction: 'Cleaned impulse lines and installed automatic compressed air blowback cycle every 8 hours.',
        preventiveAction: 'Updated daily operator log sheets to record differential pressure before and after shift blowback.',
        responsiblePerson: managerUser._id,
        assignedDepartment: 'Instrument & Electrical',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        status: 'Pending Verification',
        progressPercentage: 100,
        completedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: auditorUser._id
      },
      {
        capaCode: 'CAPA-2026-004',
        finding: createdFindings[3]._id,
        audit: createdAudits[0]._id,
        site: createdSites[0]._id,
        actionTitle: 'Spill Kit Audit & Tamper-Evident Seal Protocol',
        problemStatement: 'Chemical cart lacked absorbents following an unrecorded spill event.',
        rootCause: 'Operator did not report usage of neutralizer supplies to the central EHS store.',
        correctiveAction: 'Restocked spill cart with universal poly-pad rolls and granular neutralizing compound.',
        preventiveAction: 'Applied numbered tamper-evident breakaway security tags on all 14 site spill kits with weekly audit rounds.',
        responsiblePerson: managerUser._id,
        assignedDepartment: 'Site Safety Team',
        priority: 'Low',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: 'Verified',
        progressPercentage: 100,
        completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        verifiedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        verifiedBy: complianceUser._id,
        verificationRemarks: 'Spill kits fully replenished and inspected with security tags in place.',
        createdBy: auditorUser._id
      },
      {
        capaCode: 'CAPA-2026-005',
        finding: createdFindings[4]._id,
        audit: createdAudits[2]._id,
        site: createdSites[2]._id,
        actionTitle: 'Laboratory Satellite Accumulation Labeling Rollout',
        problemStatement: 'Unlabeled solvent carboys in laboratory synthesis areas violate RCRA standards.',
        rootCause: 'New laboratory interns were unaware of specific chemical waste labeling requirements.',
        correctiveAction: 'Affixed pre-printed hazardous waste labels with proper dates to all 5 satellite containers in QC labs.',
        preventiveAction: 'Mandated annual RCRA hazardous waste web module for all new lab personnel before access badges are active.',
        responsiblePerson: managerUser._id,
        assignedDepartment: 'QA/QC Laboratories',
        priority: 'High',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue!
        status: 'Assigned',
        progressPercentage: 20,
        createdBy: auditorUser._id
      }
    ];

    const createdCapas = await Capa.insertMany(capaData);
    console.log(`✓ Seeded ${createdCapas.length} CAPA actions (Open, In Progress, Pending Verification, Verified, Closed, Overdue)`);

    // Link back to findings
    for (let i = 0; i < createdFindings.length; i++) {
      if (createdCapas[i]) {
        createdFindings[i].assignedCapa = createdCapas[i]._id;
        await createdFindings[i].save();
      }
    }

    // 8. Seed Sample Pre-compiled Reports
    const sampleReport = await Report.create({
      reportCode: 'REP-2026-001',
      title: 'Q1 Environmental Statutory Audit Report - Apex Petrochemical',
      reportType: 'Environmental Audit Report',
      site: createdSites[0]._id,
      audit: createdAudits[0]._id,
      inspection: inspection1._id,
      generatedBy: complianceUser._id,
      generationDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      complianceScore: 82,
      executiveSummary: 'This comprehensive environmental compliance audit investigated air point source emissions, continuous effluent discharge monitors, and RCRA secondary containment. The site achieved an 82% compliance index.',
      metricsSnapshot: {
        totalFindings: 3,
        criticalFindings: 1,
        highFindings: 1,
        mediumFindings: 0,
        lowFindings: 1,
        totalCapa: 3,
        closedCapa: 1,
        overdueCapa: 0,
        compliancePercentage: 82,
        overallEvaluation: 'Moderate Compliance'
      },
      recommendations: 'Complete LDAR flange repairs and maintain weekly spill cart surveillance. Proceed with bi-annual regulatory submission.'
    });

    console.log(`✓ Seeded Sample Compliance Report "${sampleReport.title}"`);

    // 9. Seed In-App Notifications
    const notificationData = [
      {
        user: auditorUser._id,
        type: 'AUDIT_ASSIGNED',
        title: 'New Audit Assigned',
        message: 'You are appointed Lead Auditor for Q1 Comprehensive Environmental Statutory Audit (AUD-2026-001).',
        relatedEntity: 'Audit',
        entityId: createdAudits[0]._id,
        read: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        user: managerUser._id,
        type: 'CAPA_ASSIGNED',
        title: 'CAPA Action Assigned',
        message: 'You have been assigned action CAPA-2026-002: LDAR Protocol Retraining & Valve Packing Replacement.',
        relatedEntity: 'Capa',
        entityId: createdCapas[1]._id,
        read: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
      },
      {
        user: managerUser._id,
        type: 'CAPA_OVERDUE',
        title: 'CAPA Overdue Alert',
        message: 'Attention: CAPA-2026-005 (Laboratory Satellite Accumulation Labeling Rollout) is overdue!',
        relatedEntity: 'Capa',
        entityId: createdCapas[4]._id,
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        user: complianceUser._id,
        type: 'CAPA_SUBMITTED',
        title: 'CAPA Submitted for Verification',
        message: 'CAPA-2026-003 has reached 100% progress and is awaiting your compliance verification sign-off.',
        relatedEntity: 'Capa',
        entityId: createdCapas[2]._id,
        read: false,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    await Notification.insertMany(notificationData);
    console.log(`✓ Seeded ${notificationData.length} User Notifications`);

    // 10. Seed Audit Trail Logs
    const auditLogsData = [
      {
        user: adminUser._id,
        userName: adminUser.name,
        role: adminUser.role,
        action: 'CREATE',
        entityType: 'Site',
        entityId: createdSites[0]._id,
        entityCode: createdSites[0].siteCode,
        description: 'Created industrial site: Apex Petrochemical Refining Complex',
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
      },
      {
        user: adminUser._id,
        userName: adminUser.name,
        role: adminUser.role,
        action: 'CREATE',
        entityType: 'Audit',
        entityId: createdAudits[0]._id,
        entityCode: createdAudits[0].auditCode,
        description: 'Scheduled Q1 Comprehensive Environmental Statutory Audit',
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        user: auditorUser._id,
        userName: auditorUser.name,
        role: auditorUser.role,
        action: 'SUBMIT',
        entityType: 'Inspection',
        entityId: inspection1._id,
        entityCode: inspection1.inspectionCode,
        description: 'Submitted digital inspection checklist with 3 non-conformances identified',
        timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      },
      {
        user: managerUser._id,
        userName: managerUser.name,
        role: managerUser.role,
        action: 'UPDATE',
        entityType: 'Capa',
        entityId: createdCapas[0]._id,
        entityCode: createdCapas[0].capaCode,
        description: 'Completed polyurea resin sealing on berm and submitted for verification',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        user: complianceUser._id,
        userName: complianceUser.name,
        role: complianceUser.role,
        action: 'VERIFY',
        entityType: 'Capa',
        entityId: createdCapas[0]._id,
        entityCode: createdCapas[0].capaCode,
        description: 'Approved hydrostatic verification test and verified CAPA closure',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    await AuditLog.insertMany(auditLogsData);
    console.log(`✓ Seeded ${auditLogsData.length} Audit Trail logs`);

    // 11. Seed System Settings
    const defaultSettings = [
      { key: 'highComplianceThreshold', value: 85, description: 'Percentage threshold for High Compliance rating' },
      { key: 'moderateComplianceThreshold', value: 70, description: 'Percentage threshold for Moderate Compliance rating' },
      { key: 'capaOverdueGracePeriodDays', value: 3, description: 'Days before notification alert for impending CAPA due date' },
      { key: 'organizationName', value: 'Global EcoIndustries Group', description: 'Enterprise organization display name' },
      { key: 'enableAutoAuditNotifications', value: true, description: 'Trigger automatic notifications on audit assignments' }
    ];
    await Setting.insertMany(defaultSettings);
    console.log('✓ Seeded System Settings');

    console.log(`\n======================================================`);
    console.log(`  DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`======================================================`);
    console.log(`Demo Credentials:`);
    console.log(`  Admin:        admin@example.com      / password123`);
    console.log(`  Auditor:      auditor@example.com    / password123`);
    console.log(`  Site Manager: manager@example.com    / password123`);
    console.log(`  Compliance:   compliance@example.com / password123`);
    console.log(`======================================================\n`);

    if (require.main === module) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    console.error(error.stack);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
