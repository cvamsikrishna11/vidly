const mongoose = require('mongoose');
module.exports = function (req, res, next) {
    try {
        if ('params' in req && 'id' in req.params) {
            mongoose.Types.ObjectId(req.params.id);
        }

    } catch (err) {
        return res.status(404).send('Invalid id');
    }
    next();
}