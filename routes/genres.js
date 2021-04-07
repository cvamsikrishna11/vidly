const express = require('express');
const mongoose = require('mongoose');
const { Genre, validate } = require('../models/genres');

const router = express.Router();



router.get('/', async (req, res) => {
  res.send(await Genre.find().sort('name'));
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = Genre({ name: req.body.name });
  genre = await genre.save();

  res.send(genre);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  var ObjectId = mongoose.Types.ObjectId;
  const genre = await Genre.findByIdAndUpdate(new ObjectId(req.params.id), { name: req.body.name }, {
    new: true,
    useFindAndModify: false
  });

  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

router.delete('/:id', async (req, res) => {
  var ObjectId = mongoose.Types.ObjectId;
  const genre = await Genre.findByIdAndRemove(new ObjectId(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});

router.get('/:id', async (req, res) => {
  var ObjectId = mongoose.Types.ObjectId;
  const genre = await Genre.findById(new ObjectId(req.params.id));
  if (!genre) return res.status(404).send('The genre with the given ID was not found.');
  res.send(genre);
});


module.exports = router;