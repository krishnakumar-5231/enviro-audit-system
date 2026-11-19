const express = require('express');
const router = express.Router();
const {
  getAudits,
  getAuditById,
  createAudit,
  updateAudit,
  deleteAudit,
  startAudit,
  submitAudit,
  completeAudit
} = require('../controllers/auditController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(getAudits)
  .post(authorizeRoles('Administrator', 'Environmental Auditor'), createAudit);

router.route('/:id')
  .get(getAuditById)
  .put(authorizeRoles('Administrator', 'Environmental Auditor'), updateAudit)
  .delete(authorizeRoles('Administrator'), deleteAudit);

router.post('/:id/start', authorizeRoles('Administrator', 'Environmental Auditor'), startAudit);
router.post('/:id/submit', authorizeRoles('Administrator', 'Environmental Auditor'), submitAudit);
router.post('/:id/complete', authorizeRoles('Administrator', 'Compliance Officer'), completeAudit);

module.exports = router;
