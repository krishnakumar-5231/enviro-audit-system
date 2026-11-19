const express = require('express');
const router = express.Router();
const {
  getSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
} = require('../controllers/siteController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(getSites)
  .post(authorizeRoles('Administrator'), createSite);

router.route('/:id')
  .get(getSiteById)
  .put(authorizeRoles('Administrator', 'Compliance Officer'), updateSite)
  .delete(authorizeRoles('Administrator'), deleteSite);

module.exports = router;
