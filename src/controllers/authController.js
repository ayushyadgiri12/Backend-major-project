const jwt = require('jsonwebtoken');
const User = require('../models/User');
const firebase = require('../config/firebase');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const send = (res, status, user) => {
  const safe = user.toObject();
  delete safe.password;
  res.status(status).json({ success: true, token: signToken(user._id), user: safe });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered');
  const user = await User.create({ name, email, password, role });
  send(res, 201, user);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.password || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  send(res, 200, user);
});

// Exchange a Firebase Auth ID token for our own JWT
exports.firebaseLogin = asyncHandler(async (req, res) => {
  if (!firebase.isEnabled()) throw new ApiError(503, 'Firebase is not configured on the server');
  let decoded;
  try {
    decoded = await firebase.auth().verifyIdToken(req.body.idToken);
  } catch {
    throw new ApiError(401, 'Invalid Firebase ID token');
  }
  let user = await User.findOne({ $or: [{ firebaseUid: decoded.uid }, { email: decoded.email }] });
  if (!user) {
    user = await User.create({
      name: decoded.name || decoded.email.split('@')[0],
      email: decoded.email,
      firebaseUid: decoded.uid,
      role: req.body.role,
    });
  } else if (!user.firebaseUid) {
    user.firebaseUid = decoded.uid;
    await user.save();
  }
  send(res, 200, user);
});

exports.me = (req, res) => res.json({ success: true, user: req.user });
