const express = require('express');
const router = express.Router();
const {
  getCapas,
  getCapaById,
  createCapa,
  updateCapa,
  submitCapa,
  verifyCapa,
  closeCapa,
  addCapaComment,
  uploadCapaEvidence
} = require('../controllers/capaController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getCapas)
  .post(authorizeRoles('Administrator', 'Environmental Auditor', 'Site Manager', 'Compliance Officer'), createCapa);

router.route('/:id')
  .get(getCapaById)
  .put(updateCapa);

router.post('/:id/submit', submitCapa);
router.post('/:id/verify', authorizeRoles('Administrator', 'Compliance Officer', 'Environmental Auditor'), verifyCapa);
router.post('/:id/close', authorizeRoles('Administrator', 'Compliance Officer'), closeCapa);
router.post('/:id/comments', addCapaComment);
router.post('/:id/evidence', upload.single('file'), uploadCapaEvidence);

module.exports = router;
