const router = require('express').Router();
const c = require('../controllers/trackController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const v = require('../middleware/validators');

router.get('/', protect, c.getTracks);
router.get('/search', protect, c.searchTracks); // must be before /:id
router.get('/:id', protect, c.getTrack);
router.get('/:id/stream', protect, c.streamTrack);

router.post('/', protect, restrictTo('artist'), upload.single('audio'), validate(v.trackCreate), c.createTrack);
router.put('/:id', protect, restrictTo('artist'), validate(v.trackUpdate), c.updateTrack);
router.delete('/:id', protect, restrictTo('artist'), c.deleteTrack);

module.exports = router;
