const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleCheck');

router.use(protect);

router.route('/')
  .get(getUsers)
  .post(authorizeRoles('Administrator'), createUser);

router.route('/:id')
  .get(getUserById)
  .put(authorizeRoles('Administrator'), updateUser)
  .delete(authorizeRoles('Administrator'), deleteUser);

module.exports = router;
