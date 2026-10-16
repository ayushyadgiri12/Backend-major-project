const Track = require('../models/Track');
const Playlist = require('../models/Playlist');
const storage = require('../services/storage');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const populateArtist = { path: 'artist', select: 'name avatarUrl' };

const paginate = (req) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  return { page, limit, skip: (page - 1) * limit };
};

exports.getTracks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req);
  const filter = {};
  if (req.query.genre) filter.genre = req.query.genre.toLowerCase();
  if (req.query.artist) filter.artist = req.query.artist;

  const [tracks, total] = await Promise.all([
    Track.find(filter).populate(populateArtist).sort('-createdAt').skip(skip).limit(limit),
    Track.countDocuments(filter),
  ]);
  res.json({ success: true, page, total, pages: Math.ceil(total / limit), count: tracks.length, data: tracks });
});

// GET /api/tracks/search?q=rock  -> matches genre, title or album
exports.searchTracks = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) throw new ApiError(400, 'Query parameter "q" is required');
  const rx = new RegExp(escapeRegex(q), 'i');
  const tracks = await Track.find({ $or: [{ genre: rx }, { title: rx }, { album: rx }] })
    .populate(populateArtist)
    .sort('-plays')
    .limit(50);
  res.json({ success: true, count: tracks.length, data: tracks });
});

exports.getTrack = asyncHandler(async (req, res) => {
  const track = await Track.findById(req.params.id).populate(populateArtist);
  if (!track) throw new ApiError(404, 'Track not found');
  res.json({ success: true, data: track });
});

exports.createTrack = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Audio file is required (form-data field "audio")');
  const stored = await storage.saveAudio(req.file);
  const track = await Track.create({ ...req.body, ...stored, artist: req.user._id });
  res.status(201).json({ success: true, data: track });
});

exports.updateTrack = asyncHandler(async (req, res) => {
  const track = await Track.findById(req.params.id);
  if (!track) throw new ApiError(404, 'Track not found');
  if (!track.artist.equals(req.user._id)) throw new ApiError(403, 'You can only edit your own tracks');
  Object.assign(track, req.body);
  await track.save();
  res.json({ success: true, data: track });
});

exports.deleteTrack = asyncHandler(async (req, res) => {
  const track = await Track.findById(req.params.id);
  if (!track) throw new ApiError(404, 'Track not found');
  if (!track.artist.equals(req.user._id)) throw new ApiError(403, 'You can only delete your own tracks');
  await storage.deleteAudio(track);
  await Playlist.updateMany({ tracks: track._id }, { $pull: { tracks: track._id } });
  await track.deleteOne();
  res.json({ success: true, message: 'Track deleted' });
});

// GET /api/tracks/:id/stream -> counts a play and redirects to the audio file
// (Firebase signed URL / local static file; both support HTTP range requests for seeking)
exports.streamTrack = asyncHandler(async (req, res) => {
  const track = await Track.findByIdAndUpdate(req.params.id, { $inc: { plays: 1 } }, { new: true });
  if (!track) throw new ApiError(404, 'Track not found');
  res.redirect(track.audioUrl);
});
