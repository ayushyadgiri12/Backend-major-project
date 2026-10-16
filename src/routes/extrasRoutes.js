const router = require('express').Router();
const c = require('../controllers/extrasController');
const { protect } = require('../middleware/auth');

router.get('/recommendations', protect, c.getRecommendations);
router.get('/offline/tracks', c.mockTracks);

module.exports = router;
