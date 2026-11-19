const express = require('express');
const router = express.Router();
const {
  getFindings,
  getFindingById,
  createFinding,
  updateFinding,
  closeFinding,
  uploadFindingEvidence
} = require('../controllers/findingController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getFindings)
  .post(authorizeRoles('Administrator', 'Environmental Auditor'), createFinding);

router.route('/:id')
  .get(getFindingById)
  .put(updateFinding);

router.post('/:id/close', authorizeRoles('Administrator', 'Compliance Officer', 'Environmental Auditor'), closeFinding);
router.post('/:id/evidence', upload.single('file'), uploadFindingEvidence);

module.exports = router;
