const Joi = require('joi');
const mongoose = require('mongoose');


const genreSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        trim: true
    }
});

const Genre = mongoose.model('Genre', genreSchema);

function validateGenre(genre) {
    const schema = Joi.object({ name: Joi.string().min(5).max(50).required() })
    const result = schema.validate(genre);
    return result;
}

module.exports.genreSchema = genreSchema;
module.exports.Genre = Genre;
module.exports.validate = validateGenre;