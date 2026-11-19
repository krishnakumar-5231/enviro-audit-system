const express = require('express');
const router = express.Router();
const {
  getChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist
} = require('../controllers/checklistController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(getChecklists)
  .post(authorizeRoles('Administrator', 'Environmental Auditor', 'Compliance Officer'), createChecklist);

router.route('/:id')
  .get(getChecklistById)
  .put(authorizeRoles('Administrator', 'Environmental Auditor', 'Compliance Officer'), updateChecklist)
  .delete(authorizeRoles('Administrator'), deleteChecklist);

module.exports = router;
