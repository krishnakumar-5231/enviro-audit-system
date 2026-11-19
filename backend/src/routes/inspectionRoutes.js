const express = require('express');
const router = express.Router();
const {
  getInspections,
  getInspectionById,
  createInspection,
  updateInspectionItems,
  submitInspection,
  uploadItemEvidence
} = require('../controllers/inspectionController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getInspections)
  .post(authorizeRoles('Administrator', 'Environmental Auditor'), createInspection);

router.route('/:id')
  .get(getInspectionById)
  .put(authorizeRoles('Administrator', 'Environmental Auditor'), updateInspectionItems);

router.post('/:id/submit', authorizeRoles('Administrator', 'Environmental Auditor'), submitInspection);
router.post(
  '/:id/items/:questionId/evidence',
  authorizeRoles('Administrator', 'Environmental Auditor'),
  upload.single('file'),
  uploadItemEvidence
);

module.exports = router;
