const ApiError = require('../utils/ApiError');

module.exports = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    return next(new ApiError(400, error.details.map((d) => d.message).join(', ')));
  }
  req[source] = value;
  next();
};
