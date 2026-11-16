const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'அங்கீகரிக்கப்படவில்லை. உள்நுழையவும் (Not authorized to access this route)'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'deva_and_co_secret_jwt_key_2026_super_safe');
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'பயனர் கணக்கு முடக்கப்பட்டுள்ளது அல்லது காணப்படவில்லை'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'செல்லுபடியாகாத அனுமதிச் சீட்டு (Invalid or expired token)'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'இந்த செயலைச் செய்ய உங்களுக்கு அனுமதி இல்லை (Forbidden)'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
