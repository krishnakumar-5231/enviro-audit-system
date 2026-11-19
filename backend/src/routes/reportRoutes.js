const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportById,
  generateReport,
  downloadReportPdf
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(getReports);

router.post('/generate', authorizeRoles('Administrator', 'Compliance Officer', 'Environmental Auditor'), generateReport);

router.route('/:id')
  .get(getReportById);

router.get('/:id/download', downloadReportPdf);

module.exports = router;
