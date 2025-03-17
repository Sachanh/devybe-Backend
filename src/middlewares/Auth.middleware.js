const jwt = require('jsonwebtoken');
const User = require('../models/onboarding.models')

const verifyToken = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = req.headers.authorization.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.SECRET_ACCESS_KEY);

        const user = await User.findById(decoded.userID).lean();
        if (!user) {
            return res.status(403).json({ message: 'User not found, access denied' });
        }

        req.user_detail = await User.findById(decoded.userID).lean();
        if (!req.user_detail) {
            return res.status(404).json({ message: 'Account not matched' });
        }

        next();
    } catch (err) {
        console.log(err);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expired, please login again' });
        }

        return res.status(401).json({ msg: 'Invalid token, authentication failed' });
    }

};

module.exports = {verifyToken};