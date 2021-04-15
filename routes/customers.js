const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { Customer, validate } = require('../models/customers');
const validateObjectId = require('../middleware/validateObjectId');


router.get('/', async (req, res) => {
    res.send(await Customer.find().sort('name'));
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let customer = Customer({
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    });
    customer = await customer.save();

    res.send(customer);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    var ObjectId = mongoose.Types.ObjectId;
    const customer = await Customer.findByIdAndUpdate(new ObjectId(req.params.id), {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold
    }, {
        new: true,
        useFindAndModify: false
    });

    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
});

router.delete('/:id', validateObjectId, async (req, res) => {
    var ObjectId = mongoose.Types.ObjectId;
    const customer = await Customer.findByIdAndRemove(new ObjectId(req.params.id));
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
});

router.get('/:id', validateObjectId, async (req, res) => {
    var ObjectId = mongoose.Types.ObjectId;
    const customer = await Customer.findById(new ObjectId(req.params.id));
    if (!customer) return res.status(404).send('The customer with the given ID was not found.');
    res.send(customer);
});



module.exports = router;