const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const asyncHandler = require('../utils/asyncHandler');

// Recommendations: top genres from the user's playlists -> most played tracks in those genres
exports.getRecommendations = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({ owner: req.user._id }).populate('tracks', 'genre');
  const inPlaylists = new Set();
  const genreCount = {};
  playlists.forEach((p) =>
    p.tracks.forEach((t) => {
      inPlaylists.add(String(t._id));
      genreCount[t.genre] = (genreCount[t.genre] || 0) + 1;
    })
  );
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);

  const filter = { _id: { $nin: [...inPlaylists] } };
  if (topGenres.length) filter.genre = { $in: topGenres };

  const tracks = await Track.find(filter).populate('artist', 'name').sort('-plays').limit(20);
  res.json({
    success: true,
    basedOn: topGenres.length ? topGenres : 'popular tracks',
    count: tracks.length,
    data: tracks,
  });
});

// Offline (mock) API: static data so a frontend can work without DB/internet
const mock = [
  { id: 'm1', title: 'Midnight Drive', artist: 'Demo Artist', genre: 'synthwave', duration: 215, audioUrl: '/uploads/demo1.mp3' },
  { id: 'm2', title: 'Rock Anthem', artist: 'Demo Band', genre: 'rock', duration: 198, audioUrl: '/uploads/demo2.mp3' },
  { id: 'm3', title: 'Lo-Fi Study', artist: 'Chill Co', genre: 'lofi', duration: 240, audioUrl: '/uploads/demo3.mp3' },
];
exports.mockTracks = (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const data = q ? mock.filter((t) => t.genre.includes(q) || t.title.toLowerCase().includes(q)) : mock;
  res.json({ success: true, offline: true, count: data.length, data });
};
