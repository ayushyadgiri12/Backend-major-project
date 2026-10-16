const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const firebase = require('../config/firebase');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const makeName = (originalname) =>
  `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${path.extname(originalname)}`;

exports.UPLOAD_DIR = UPLOAD_DIR;

exports.saveAudio = async (file) => {
  const name = makeName(file.originalname);

  if (firebase.isEnabled()) {
    const storagePath = `tracks/${name}`;
    const fileRef = firebase.bucket().file(storagePath);
    await fileRef.save(file.buffer, { contentType: file.mimetype });
    const [url] = await fileRef.getSignedUrl({ action: 'read', expires: '01-01-2100' });
    return { audioUrl: url, storagePath, storageType: 'firebase' };
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), file.buffer);
  return {
    audioUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${name}`,
    storagePath: name,
    storageType: 'local',
  };
};

exports.deleteAudio = async (track) => {
  try {
    if (track.storageType === 'firebase' && firebase.isEnabled()) {
      await firebase.bucket().file(track.storagePath).delete();
    } else if (track.storageType === 'local') {
      fs.unlinkSync(path.join(UPLOAD_DIR, track.storagePath));
    }
  } catch (err) {
    console.warn('Could not delete audio file:', err.message);
  }
};
