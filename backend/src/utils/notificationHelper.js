const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async ({
  userId = null,
  role = null,
  type,
  title,
  message,
  relatedEntity = null,
  entityId = null
}) => {
  try {
    if (userId) {
      await Notification.create({
        user: userId,
        type,
        title,
        message,
        relatedEntity,
        entityId
      });
    } else if (role) {
      const users = await User.find({ role, status: 'Active' }).select('_id');
      const notifications = users.map((u) => ({
        user: u._id,
        type,
        title,
        message,
        relatedEntity,
        entityId
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  } catch (error) {
    console.error('Notification creation error (non-blocking):', error.message);
  }
};

module.exports = { createNotification };
