const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../middleware/validators');

router.post('/register', validate(v.register), c.register);
router.post('/login', validate(v.login), c.login);
router.post('/firebase', validate(v.firebaseLogin), c.firebaseLogin);
router.get('/me', protect, c.me);

module.exports = router;
