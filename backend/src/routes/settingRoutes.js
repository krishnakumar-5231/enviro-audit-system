const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(getSettings)
  .put(authorizeRoles('Administrator'), updateSettings);

module.exports = router;
