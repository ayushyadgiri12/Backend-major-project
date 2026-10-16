const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const populate = [
  { path: 'owner', select: 'name' },
  { path: 'tracks', populate: { path: 'artist', select: 'name' } },
];

const getOwned = async (id, userId) => {
  const playlist = await Playlist.findById(id);
  if (!playlist) throw new ApiError(404, 'Playlist not found');
  if (!playlist.owner.equals(userId)) throw new ApiError(403, 'You do not own this playlist');
  return playlist;
};

const notify = (req, playlistId, event, payload) => {
  const io = req.app.get('io');
  if (io) io.to(`playlist:${playlistId}`).emit(event, payload);
};

exports.createPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, data: playlist });
});

// Own playlists + public playlists from others
exports.getPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ $or: [{ owner: req.user._id }, { isPublic: true }] })
    .populate({ path: 'owner', select: 'name' })
    .select('-tracks')
    .sort('-updatedAt');
  res.json({ success: true, count: playlists.length, data: playlists });
});

exports.getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findById(req.params.id).populate(populate);
  if (!playlist) throw new ApiError(404, 'Playlist not found');
  if (!playlist.isPublic && !playlist.owner._id.equals(req.user._id)) {
    throw new ApiError(403, 'This playlist is private');
  }
  res.json({ success: true, data: playlist });
});

exports.updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await getOwned(req.params.id, req.user._id);
  Object.assign(playlist, req.body);
  await playlist.save();
  notify(req, playlist._id, 'playlist:updated', { playlistId: playlist._id });
  res.json({ success: true, data: playlist });
});

exports.deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await getOwned(req.params.id, req.user._id);
  await playlist.deleteOne();
  res.json({ success: true, message: 'Playlist deleted' });
});

exports.addTrack = asyncHandler(async (req, res) => {
  const playlist = await getOwned(req.params.id, req.user._id);
  const { trackId } = req.body;
  if (!(await Track.exists({ _id: trackId }))) throw new ApiError(404, 'Track not found');
  if (playlist.tracks.some((t) => t.equals(trackId))) throw new ApiError(409, 'Track already in playlist');
  playlist.tracks.push(trackId);
  await playlist.save();
  notify(req, playlist._id, 'playlist:track-added', { playlistId: playlist._id, trackId });
  res.status(201).json({ success: true, data: playlist });
});

exports.removeTrack = asyncHandler(async (req, res) => {
  const playlist = await getOwned(req.params.id, req.user._id);
  const before = playlist.tracks.length;
  playlist.tracks = playlist.tracks.filter((t) => !t.equals(req.params.trackId));
  if (playlist.tracks.length === before) throw new ApiError(404, 'Track is not in this playlist');
  await playlist.save();
  notify(req, playlist._id, 'playlist:track-removed', { playlistId: playlist._id, trackId: req.params.trackId });
  res.json({ success: true, data: playlist });
});
