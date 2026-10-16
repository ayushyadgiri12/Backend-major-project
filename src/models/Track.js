const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    genre: { type: String, required: true, lowercase: true, trim: true, index: true },
    album: { type: String, default: '', trim: true },
    duration: { type: Number, default: 0 }, // seconds
    coverUrl: { type: String, default: '' },
    audioUrl: { type: String, required: true },
    storagePath: { type: String, required: true }, // firebase path or local filename
    storageType: { type: String, enum: ['firebase', 'local'], required: true },
    plays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

trackSchema.index({ title: 'text', album: 'text' });

module.exports = mongoose.model('Track', trackSchema);
