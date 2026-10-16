const router = require('express').Router();
const c = require('../controllers/playlistController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../middleware/validators');

router.use(protect);

router.route('/').post(validate(v.playlistCreate), c.createPlaylist).get(c.getPlaylists);
router
  .route('/:id')
  .get(c.getPlaylist)
  .put(validate(v.playlistUpdate), c.updatePlaylist)
  .delete(c.deletePlaylist);

router.post('/:id/tracks', validate(v.addTrack), c.addTrack);
router.delete('/:id/tracks/:trackId', c.removeTrack);

module.exports = router;
