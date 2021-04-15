const Joi = require('joi');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const validate = require('../middleware/validate');



router.post('/', [auth, validate(validateReturn)], async (req, res) => {

    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);
    if (!rental) {
        return res.status(404).send('Rental not found!');
    }
    if (rental && rental.dateReturned) {
        return res.status(400).send('Rental already processed!');
    }

    rental.return();
    await rental.save();

    await Movie.updateOne({ _id: rental.movie._id }, {
        $inc: { numberInStock: 1 }
    });


    return res.send(rental);
});


function validateReturn(req) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    })
    const result = schema.validate(req);
    return result;
}

module.exports = router;