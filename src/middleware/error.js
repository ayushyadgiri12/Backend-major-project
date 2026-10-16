exports.notFound = (req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });

exports.errorHandler = (err, req, res, next) => { // eslint-disable-line
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') { status = 400; message = `Invalid ${err.path}: ${err.value}`; }
  if (err.code === 11000) { status = 409; message = `Duplicate value for: ${Object.keys(err.keyValue).join(', ')}`; }
  if (err.name === 'ValidationError' && err.errors) { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.name === 'MulterError') { status = 400; }

  if (status === 500) console.error(err);
  res.status(status).json({ success: false, message });
};
