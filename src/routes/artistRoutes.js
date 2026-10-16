const router = require('express').Router();
const c = require('../controllers/artistController');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, c.getArtists);
router.get('/me/dashboard', protect, restrictTo('artist'), c.getDashboard); // before /:id
router.get('/:id', protect, c.getArtist);

module.exports = router;
