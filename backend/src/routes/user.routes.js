const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { changePasswordSchema } = require('../validations/auth.validation');
const {
  getProfile, updateProfile, updatePreferences, changePassword,
  subscribePush, unsubscribePush, deleteAccount,
} = require('../controllers/user.controller');

router.use(authenticate);
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/preferences', updatePreferences);
router.patch('/password', validate(changePasswordSchema), changePassword);
router.post('/notifications/subscribe', subscribePush);
router.post('/notifications/unsubscribe', unsubscribePush);
router.delete('/account', deleteAccount);

module.exports = router;
