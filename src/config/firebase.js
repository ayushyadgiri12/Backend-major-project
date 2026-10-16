const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

let enabled = false;
const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;

if (keyPath && bucketName && fs.existsSync(path.resolve(keyPath))) {
  admin.initializeApp({
    credential: admin.credential.cert(require(path.resolve(keyPath))),
    storageBucket: bucketName,
  });
  enabled = true;
  console.log('Firebase initialised');
} else {
  console.log('Firebase not configured -> using local ./uploads storage');
}

module.exports = {
  admin,
  isEnabled: () => enabled,
  bucket: () => admin.storage().bucket(),
  auth: () => admin.auth(),
};
