const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'deva_and_co_secret_jwt_key_2026_super_safe', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'பயனர்பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும் (Please provide username and password)'
      });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல் (Invalid username or password)'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'இந்த கணக்கு முடக்கப்பட்டுள்ளது (Account is deactivated)'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'தற்போதைய மற்றும் புதிய கடவுச்சொற்களை உள்ளிடவும்'
      });
    }

    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        success: false,
        message: 'தற்போதைய கடவுச்சொல் தவறானது (Current password incorrect)'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'கடவுச்சொல் வெற்றிகரமாக மாற்றப்பட்டது (Password updated successfully)'
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { username, password, name, role, phone } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'அனைத்து விவரங்களையும் பூர்த்தி செய்யவும்' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'இந்த பயனர்பெயர் ஏற்கனவே உள்ளது' });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      password,
      name,
      role: role || 'ACCOUNTANT',
      phone
    });

    res.status(201).json({
      success: true,
      message: 'புதிய பணியாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'உங்கள் சொந்த கணக்கை நீக்க முடியாது' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'பயனர் கணக்கு நீக்கப்பட்டது' });
  } catch (error) {
    next(error);
  }
};
