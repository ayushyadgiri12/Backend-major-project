const mongoose = require('mongoose');
const User = require('../models/User');
const Track = require('../models/Track');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

exports.getArtists = asyncHandler(async (req, res) => {
  const artists = await User.aggregate([
    { $match: { role: 'artist' } },
    { $lookup: { from: 'tracks', localField: '_id', foreignField: 'artist', as: 'tracks' } },
    {
      $project: {
        name: 1, bio: 1, avatarUrl: 1,
        trackCount: { $size: '$tracks' },
        totalPlays: { $sum: '$tracks.plays' },
      },
    },
    { $sort: { totalPlays: -1 } },
  ]);
  res.json({ success: true, count: artists.length, data: artists });
});

exports.getArtist = asyncHandler(async (req, res) => {
  const artist = await User.findOne({ _id: req.params.id, role: 'artist' }).select('name bio avatarUrl createdAt');
  if (!artist) throw new ApiError(404, 'Artist not found');
  const tracks = await Track.find({ artist: artist._id }).sort('-plays');
  res.json({ success: true, data: { ...artist.toObject(), tracks } });
});

// Artist dashboard (own stats)
exports.getDashboard = asyncHandler(async (req, res) => {
  const artistId = new mongoose.Types.ObjectId(req.user._id);
  const [totals] = await Track.aggregate([
    { $match: { artist: artistId } },
    { $group: { _id: null, totalTracks: { $sum: 1 }, totalPlays: { $sum: '$plays' } } },
  ]);
  const topTracks = await Track.find({ artist: artistId }).sort('-plays').limit(5).select('title genre plays');
  const playsByGenre = await Track.aggregate([
    { $match: { artist: artistId } },
    { $group: { _id: '$genre', plays: { $sum: '$plays' }, tracks: { $sum: 1 } } },
    { $sort: { plays: -1 } },
  ]);
  res.json({
    success: true,
    data: {
      totalTracks: totals?.totalTracks || 0,
      totalPlays: totals?.totalPlays || 0,
      topTracks,
      playsByGenre,
    },
  });
});
