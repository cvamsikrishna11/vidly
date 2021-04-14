const { Rental, validate } = require('../models/rental');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customers');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();
const log = require('../startup/logging');


Fawn.init(mongoose);

router.get('/', async (req, res) => {
  log.info(`Return rentals...`);
  const rentals = await Rental.find().sort('-dateOut');
  res.send(rentals);
});

router.post('/', async (req, res) => {
  log.info(`Create rental...`);
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(mongoose.Types.ObjectId(req.body.customerId));
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await Movie.findById(mongoose.Types.ObjectId(req.body.movieId));
  if (!movie) return res.status(400).send('Invalid movie.');

  if (movie.numberInStock === 0) return res.status(400).send('Movie not in stock.');

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate
    }
  });
  try {
    new Fawn.Task()
      .save('rentals', rental)
      .update('movies', { _id: movie._id }, {
        $inc: { numberInStock: -1 }
      })
      .run();
  } catch (err) {
    console.log('error: ', err);
    res.status(500).send('something failed');
  }
  res.send(rental);
});

router.get('/:id', async (req, res) => {
  log.info(`Return given rental...`);
  const rental = await Rental.findById(mongoose.Types.ObjectId(req.params.id));

  if (!rental) return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

module.exports = router;