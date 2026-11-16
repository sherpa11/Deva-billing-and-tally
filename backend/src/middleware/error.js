const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'சேவையகப் பிழை (Server Error)';

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'செல்லுபடியாகாத அடையாளக் குறியீடு (Invalid ID)';
  } else if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'பதிவு';
    message = `இந்த ${field} ஏற்கனவே உள்ளது (Duplicate entry)`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
