const moment = require('moment');
const request = require('supertest');
const { Rental } = require('../../models/rental');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/users');
const mongoose = require('mongoose');

let server;

describe('/api/returns/', () => {
    let customerId;
    let movieId;
    let rental;
    let token;
    let movie;

    beforeEach(async () => {
        server = require('../../index');
        customerId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345' },
            numberInStock: 10
        });

        await movie.save();

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'

            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            }
        });

        await rental.save()
    });
    afterEach(async () => {
        await Rental.remove({});
        await Movie.remove({});
        await server.close();
    });

    const exec = () => {
        return request(server)
            .post('/api/returns')
            .set('x-auth-token', token)
            .send({ customerId, movieId });
    };


    it('should return 401 if client is not logged in, invalid', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
    });

    it('should return 400 if customer id is not presented, invalid', async () => {
        customerId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 400 if movie id is not presented, invalid', async () => {
        movieId = '';
        const res = await exec();
        expect(res.status).toBe(400);
    });


    it('should return 404 if no rental found for the customer/movie, invalid', async () => {
        await Rental.remove({})
        const res = await exec();
        expect(res.status).toBe(404);
    });

    it('should return 400 if dateReturned is already set, invalid', async () => {
        rental.dateReturned = new Date();
        await rental.save();
        const res = await exec();
        expect(res.status).toBe(400);
    });

    it('should return 200 if valid request, valid', async () => {
        const res = await exec();
        expect(res.status).toBe(200);
    });

    it('should set return date if valid request, valid', async () => {
        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);
        const diff = new Date() - rentalInDb.dateReturned;
        expect(diff).toBeLessThan(10 * 1000);
    });

    it('should set rental fee if input is valid, valid', async () => {
        rental.dateOut = moment().add(-7, 'days').toDate();
        await rental.save();

        const res = await exec();

        const rentalInDb = await Rental.findById(rental._id);

        expect(rentalInDb.rentalFee).toBe(14);
    });

    it('should increase movie stock if input is valid, valid', async () => {
        const res = await exec();

        const movieInDb = await Movie.findById(movieId);

        expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });


    it('should return rental if input is valid, valid', async () => {
        const res = await exec();
        const rentalInDb = await Rental.findById(rental._id);       
        expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie']));
    });

});