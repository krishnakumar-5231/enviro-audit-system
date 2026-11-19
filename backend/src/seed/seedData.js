const seedUsers = [
  {
    name: 'Sarah Jenkins (Admin)',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Administrator',
    department: 'Corporate Environmental Management',
    phone: '+1 (555) 019-2831',
    status: 'Active'
  },
  {
    name: 'Dr. Michael Chen',
    email: 'auditor@example.com',
    password: 'password123',
    role: 'Environmental Auditor',
    department: 'Lead Environmental Assurance',
    phone: '+1 (555) 018-9942',
    status: 'Active'
  },
  {
    name: 'Marcus Vance',
    email: 'manager@example.com',
    password: 'password123',
    role: 'Site Manager',
    department: 'Plant Operations & Safety',
    phone: '+1 (555) 017-3321',
    status: 'Active'
  },
  {
    name: 'Elena Rostova',
    email: 'compliance@example.com',
    password: 'password123',
    role: 'Compliance Officer',
    department: 'Regulatory Compliance & Statutory Legal',
    phone: '+1 (555) 016-7788',
    status: 'Active'
  }
];

const seedSites = [
  {
    siteCode: 'APEX-TX-01',
    name: 'Apex Petrochemical Refining Complex',
    industryType: 'Petrochemical Refining',
    location: 'Houston Ship Channel Basin',
    address: '4200 Industrial Parkway Blvd',
    city: 'Baytown',
    state: 'Texas',
    country: 'United States',
    contactPerson: 'Marcus Vance',
    contactEmail: 'manager@example.com',
    contactPhone: '+1 (713) 555-0144',
    status: 'Active',
    environmentalClearanceNumber: 'EPA-TX-R6-882910'
  },
  {
    siteCode: 'GF-STEEL-02',
    name: 'GreenField Specialty Steel Works',
    industryType: 'Metallurgical & Heavy Manufacturing',
    location: 'Lake Michigan Industrial Corridor',
    address: '1100 Furnaceworks Road',
    city: 'Gary',
    state: 'Indiana',
    country: 'United States',
    contactPerson: 'David Miller',
    contactEmail: 'dmiller@greenfieldsteel.com',
    contactPhone: '+1 (219) 555-0182',
    status: 'Active',
    environmentalClearanceNumber: 'IN-IDEM-STEEL-49102'
  },
  {
    siteCode: 'CASC-PHARM-03',
    name: 'Cascade Bio-Pharma Synthesis Plant',
    industryType: 'Pharmaceuticals & Fine Chemicals',
    location: 'Pacific Northwest Science Park',
    address: '8800 BioTech Way, Building 4',
    city: 'Bothell',
    state: 'Washington',
    country: 'United States',
    contactPerson: 'Rachel Adams',
    contactEmail: 'radams@cascadepsharma.com',
    contactPhone: '+1 (425) 555-0199',
    status: 'Active',
    environmentalClearanceNumber: 'WA-ECY-NPDES-7731'
  },
  {
    siteCode: 'EVG-AGRO-04',
    name: 'Evergreen Agro-Chemical Facilities',
    industryType: 'Agricultural Chemicals & Fertilizers',
    location: 'Midwest Agricultural District',
    address: '500 CropCare Highway',
    city: 'Des Moines',
    state: 'Iowa',
    country: 'United States',
    contactPerson: 'Thomas Briggs',
    contactEmail: 'tbriggs@evergreenagro.com',
    contactPhone: '+1 (515) 555-0128',
    status: 'Active',
    environmentalClearanceNumber: 'IA-DNR-EHS-33821'
  }
];

const seedChecklist = {
  checklistCode: 'EHS-MASTER-2026',
  title: 'Comprehensive Industrial Environmental Compliance Audit Checklist',
  description: 'Standardized operational checklist covering CAA air emissions, CWA effluent discharge, RCRA hazardous waste, SPCC spill containment, and statutory reporting protocols.',
  version: '2.1',
  industryType: 'General Industrial & Chemical',
  categories: [
    { name: 'Air Quality & Emissions', description: 'Stationary source point emissions, flares, VOCs and CEMS monitors' },
    { name: 'Effluent & Wastewater Treatment', description: 'Effluent Treatment Plant (ETP), parameter testing and outfall compliance' },
    { name: 'Hazardous Waste Management', description: 'RCRA secondary containment, manifest logs, labeling and disposal' },
    { name: 'Spill Prevention & Control', description: 'SPCC containment integrity, spill kits, and rapid shutoff valves' },
    { name: 'Statutory Permitting & Documentation', description: 'Environmental authorizations, Title V, DMR logs and public filings' }
  ],
  questions: [
    // Category 1: Air Quality & Emissions
    {
      questionId: 'Q-AIR-01',
      category: 'Air Quality & Emissions',
      questionText: 'Are Continuous Emission Monitoring Systems (CEMS) properly calibrated with current Cylinder Gas Audit (CGA) records?',
      requirementReference: 'Clean Air Act Title V / 40 CFR Part 60 Appendix F',
      guidanceNotes: 'Inspect daily drift logs and quarterly calibration gases certificate verification.',
      riskLevel: 'Critical',
      isMandatory: true,
      order: 1
    },
    {
      questionId: 'Q-AIR-02',
      category: 'Air Quality & Emissions',
      questionText: 'Is the VOC Leak Detection and Repair (LDAR) program conducted according to EPA Method 21 quarterly monitoring schedules?',
      requirementReference: '40 CFR Part 63 Subpart H',
      guidanceNotes: 'Verify sniffer calibration and repair tags on valves, flanges, and pump seals.',
      riskLevel: 'High',
      isMandatory: true,
      order: 2
    },
    {
      questionId: 'Q-AIR-03',
      category: 'Air Quality & Emissions',
      questionText: 'Are particulate matter baghouses and electrostatic precipitators operating within design differential pressure drop ranges?',
      requirementReference: 'State Implementation Plan (SIP) Dust Control Rule 401',
      guidanceNotes: 'Check manometer readings against permit operating thresholds.',
      riskLevel: 'Medium',
      isMandatory: true,
      order: 3
    },
    {
      questionId: 'Q-AIR-04',
      category: 'Air Quality & Emissions',
      questionText: 'Is thermal oxidizer combustion chamber temperature continuously maintained above minimum destruction efficiency temperatures?',
      requirementReference: 'Air Quality Permit Specific Condition 14.B',
      guidanceNotes: 'Review continuous digital temperature logs for previous 90 operational days.',
      riskLevel: 'Critical',
      isMandatory: true,
      order: 4
    },

    // Category 2: Effluent & Wastewater
    {
      questionId: 'Q-WST-01',
      category: 'Effluent & Wastewater Treatment',
      questionText: 'Are treated effluent discharge parameters (pH, COD, BOD, TSS, Heavy Metals) strictly compliant with NPDES discharge permit limits?',
      requirementReference: 'Clean Water Act Sec 402 / NPDES Outfall 001',
      guidanceNotes: 'Cross-reference certified third-party laboratory analytical reports against daily online sensor records.',
      riskLevel: 'Critical',
      isMandatory: true,
      order: 5
    },
    {
      questionId: 'Q-WST-02',
      category: 'Effluent & Wastewater Treatment',
      questionText: 'Is the biological wastewater aeration basin dissolved oxygen (DO) and MLSS maintained within optimal metabolic range?',
      requirementReference: 'Standard Operating Procedure EHS-ETP-104',
      guidanceNotes: 'Examine clarifier scum baffles, sludge settling velocity and recycle pumps.',
      riskLevel: 'Medium',
      isMandatory: true,
      order: 6
    },
    {
      questionId: 'Q-WST-03',
      category: 'Effluent & Wastewater Treatment',
      questionText: 'Are industrial stormwater retention ponds and oil/water separator interceptors inspected and free of surface hydrocarbon sheens?',
      requirementReference: 'Multi-Sector General Permit (MSGP) Stormwater Sector C',
      guidanceNotes: 'Verify visually during dry and post-precipitation inspections.',
      riskLevel: 'High',
      isMandatory: true,
      order: 7
    },

    // Category 3: Hazardous Waste Management
    {
      questionId: 'Q-HAZ-01',
      category: 'Hazardous Waste Management',
      questionText: 'Do all 55-gallon hazardous waste storage drums possess 110% secondary containment capacity free of liquid accumulation or cracks?',
      requirementReference: '40 CFR 264.175 Secondary Containment Regulations',
      guidanceNotes: 'Inspect berms, sumps, and chemical resistant coatings in central staging warehouse.',
      riskLevel: 'High',
      isMandatory: true,
      order: 8
    },
    {
      questionId: 'Q-HAZ-02',
      category: 'Hazardous Waste Management',
      questionText: 'Are hazardous waste satellite accumulation containers sealed air-tight with RCRA hazardous labels stating start accumulation dates?',
      requirementReference: '40 CFR 262.15 Satellite Accumulation Area Standards',
      guidanceNotes: 'Inspect production floor collection points. Containers must be closed except when adding waste.',
      riskLevel: 'High',
      isMandatory: true,
      order: 9
    },
    {
      questionId: 'Q-HAZ-03',
      category: 'Hazardous Waste Management',
      questionText: 'Are incompatible chemicals (acids, bases, cyanides, oxidizers) physically segregated with dedicated isolation curbs?',
      requirementReference: 'OSHA 1910.1200 / EPA Chemical Safety Advisory',
      guidanceNotes: 'Ensure minimum 20ft separation or impervious blast/firewall partitioning.',
      riskLevel: 'Critical',
      isMandatory: true,
      order: 10
    },
    {
      questionId: 'Q-HAZ-04',
      category: 'Hazardous Waste Management',
      questionText: 'Are uniform hazardous waste manifests (EPA Form 8700-22) signed, tracked, and reconciled with TSDF return copies within 45 days?',
      requirementReference: '40 CFR 262.42 Exception Reporting Protocols',
      guidanceNotes: 'Audit manifest archive files for hazardous solvent and heavy sludges disposal.',
      riskLevel: 'Medium',
      isMandatory: true,
      order: 11
    },

    // Category 4: Spill Prevention & Emergency Control
    {
      questionId: 'Q-SPL-01',
      category: 'Spill Prevention & Control',
      questionText: 'Is the facility Spill Prevention, Control, and Countermeasure (SPCC) plan certified by a Professional Engineer and reviewed within 5 years?',
      requirementReference: '40 CFR Part 112.3 SPCC Guidelines',
      guidanceNotes: 'Inspect PE certification stamp and facility layout attachment drawings.',
      riskLevel: 'High',
      isMandatory: true,
      order: 12
    },
    {
      questionId: 'Q-SPL-02',
      category: 'Spill Prevention & Control',
      questionText: 'Are emergency spill response kits (neutralizers, absorbent booms, non-sparking shovels, PPE) fully stocked and accessible?',
      requirementReference: 'Facility Integrated Contingency Plan (ICP) Sec 7',
      guidanceNotes: 'Inspect security seals on chemical and fuel loading dock emergency spill carts.',
      riskLevel: 'Medium',
      isMandatory: true,
      order: 13
    },
    {
      questionId: 'Q-SPL-03',
      category: 'Spill Prevention & Control',
      questionText: 'Are storm drainage emergency isolation gate valves operational and tested quarterly for rapid shutoff during accidental release?',
      requirementReference: 'Spill Containment Protocol EHS-SCP-02',
      guidanceNotes: 'Observe physical actuation of pneumatic and manual knife gate valves at perimeter boundary.',
      riskLevel: 'High',
      isMandatory: true,
      order: 14
    },

    // Category 5: Statutory Permitting & Documentation
    {
      questionId: 'Q-PER-01',
      category: 'Statutory Permitting & Documentation',
      questionText: 'Are all operational environmental permits (Air, Water, RCRA, Hazardous Material Storage) currently active without lapsed renewal filings?',
      requirementReference: 'Environmental Regulatory Authorization Act',
      guidanceNotes: 'Review renewal calendar and correspondence with federal/state environmental protection agencies.',
      riskLevel: 'Critical',
      isMandatory: true,
      order: 15
    },
    {
      questionId: 'Q-PER-02',
      category: 'Statutory Permitting & Documentation',
      questionText: 'Have monthly Discharge Monitoring Reports (DMR) and Toxic Release Inventory (TRI Form R) reports been submitted prior to statutory deadlines?',
      requirementReference: 'EPCRA Section 313 / Clean Water Act DMR Requirements',
      guidanceNotes: 'Inspect electronic confirmation receipts from EPA Central Data Exchange (CDX).',
      riskLevel: 'High',
      isMandatory: true,
      order: 16
    }
  ]
};

module.exports = {
  seedUsers,
  seedSites,
  seedChecklist
};
