const Joi = require('joi');

exports.register = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('listener', 'artist').default('listener'),
});

exports.login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.firebaseLogin = Joi.object({
  idToken: Joi.string().required(),
  role: Joi.string().valid('listener', 'artist').default('listener'),
});

exports.trackCreate = Joi.object({
  title: Joi.string().min(1).max(120).required(),
  genre: Joi.string().min(2).max(40).required(),
  album: Joi.string().allow('').max(120),
  duration: Joi.number().min(0),
  coverUrl: Joi.string().uri().allow(''),
});

exports.trackUpdate = Joi.object({
  title: Joi.string().min(1).max(120),
  genre: Joi.string().min(2).max(40),
  album: Joi.string().allow('').max(120),
  duration: Joi.number().min(0),
  coverUrl: Joi.string().uri().allow(''),
}).min(1);

exports.playlistCreate = Joi.object({
  name: Joi.string().min(1).max(80).required(),
  description: Joi.string().allow('').max(300),
  isPublic: Joi.boolean(),
  tracks: Joi.array().items(Joi.string().hex().length(24)),
});

exports.playlistUpdate = Joi.object({
  name: Joi.string().min(1).max(80),
  description: Joi.string().allow('').max(300),
  isPublic: Joi.boolean(),
}).min(1);

exports.addTrack = Joi.object({
  trackId: Joi.string().hex().length(24).required(),
});
