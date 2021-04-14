const jwt = require('jsonwebtoken');
const config = require('config');
function admin(req, res, next) {
    const token = req.header('x-auth-token');
    if (!req.user.isAdmin) {
        // 401 unauthorized
        // 403 forbidden
        return res.status(403).send('Access denied.');
    }

    next();
}

module.exports = admin;