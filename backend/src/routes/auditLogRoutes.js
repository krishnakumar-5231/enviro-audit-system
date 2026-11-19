const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditLogController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);
router.get('/', authorizeRoles('Administrator', 'Compliance Officer'), getAuditLogs);

module.exports = router;
