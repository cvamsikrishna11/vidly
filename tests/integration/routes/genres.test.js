const { v4: uuidv4 } = require('uuid');
const request = require('supertest');
const { Genre } = require('../../../models/genres');
const { User } = require('../../../models/users');
const mongoose = require('mongoose');
let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../../index'); });
    afterEach(async () => {        
        await Genre.remove({});
        await server.close();
    });

    describe('GET /', () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();


        });
    });

    describe('GET /:id', () => {

        it('should return 401 if client is not logged in, invalid', async () => {
            let token = '';
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server)
                .get('/api/genres/' + genre.id)
                .set('x-auth-token', token);

            expect(res.status).toBe(401);

        });


        it('should return a genre if valid id is passed, valid', async () => {
            const token = new User({ isAdmin: true }).generateAuthToken();
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server)
                .get('/api/genres/' + genre.id)
                .set('x-auth-token', token);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);

        });

        it('should return 404 if invalid id is passed, invalid', async () => {
            const token = new User({ isAdmin: true }).generateAuthToken();
            const res = await request(server).get('/api/genres/' + uuidv4()).set('x-auth-token', token);;

            expect(res.status).toBe(404);


        });


        it('should return 404 if no genre with given id exists is passed, invalid', async () => {
            const token = new User({ isAdmin: true }).generateAuthToken();
            const res = await request(server).get('/api/genres/' + mongoose.Types.ObjectId()).set('x-auth-token', token);

            expect(res.status).toBe(404);


        });
    });


    describe('POST /', () => {

        /*
        Define the happy path and then in each test, we change
        one param that clearly aligns with the name of the test
        */

        let token;
        let name;
        const exec = async () => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        })


        it('should return 401 if client is not logged in, invalid', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters, invalid', async () => {
            name = '1234';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters, invalid', async () => {
            name = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });


        it('should save genre if its valid, valid', async () => {

            await exec();

            const genre = await Genre.find({ name: 'genre1' });
            expect(genre).not.toBeNull();
        });


        it('should return genre if its valid, valid', async () => {

            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });



    });


    describe('PUT /', () => {

        /*
        Define the happy path and then in each test, we change
        one param that clearly aligns with the name of the test
        */

        let token;
        let newName;
        let genre;
        let id;

        beforeEach(async () => {
            token = new User().generateAuthToken();
            // Before each test we need to create a genre and 
            // put it in the database.      
            genre = new Genre({ name: 'genre1' });
            await genre.save();
            id = genre._id;
            newName = 'updatedName';
        })

        const exec = async () => {
            return await request(server)
                .put('/api/genres/' + id)
                .set('x-auth-token', token)
                .send({ name: newName });
        };


        it('should return 401 if client is not logged in, invalid', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if genre name is less than 5 characters, invalid', async () => {
            newName = 'a';
            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters, invalid', async () => {
            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is invalid, invalid', async () => {
            id = uuidv4();

            const res = await exec();
            expect(res.status).toBe(404);
        });


        it('should return 404 when the given id is not found, invalid', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should update the genre if input is valid, valid', async () => {
            await exec();

            const updatedGenre = await Genre.findById(genre._id);

            expect(updatedGenre.name).toBe(newName);
        });

        it('should return genre object the if it is valid, valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id', id.toHexString());
            expect(res.body).toHaveProperty('name', newName);
        });


    });


    describe('DELETE /:id', () => {

        /*
       Define the happy path and then in each test, we change
       one param that clearly aligns with the name of the test
       */

        let token;
        let genre;
        let id;
        let user;
        beforeEach(async () => {
            user = { _id: mongoose.Types.ObjectId(), isAdmin: true }
            token = new User(user).generateAuthToken();
            // Before each test we need to create a genre and 
            // put it in the database.      
            genre = new Genre({ name: 'genre1' });
            await genre.save();
            id = genre._id;
        });

        const exec = async () => {
            return await request(server)
                .delete('/api/genres/' + id)
                .set('x-auth-token', token);
        };

        it('should return 401 if client is not logged in, invalid', async () => {
            token = '';
            const res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 404 if id is invalid, invalid', async () => {
            id = uuidv4();

            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 403 if user isAdmin is false, invalid', async () => {
            user = { _id: mongoose.Types.ObjectId(), isAdmin: false }
            token = new User(user).generateAuthToken();

            const res = await exec();
            expect(res.status).toBe(403);
        });

        it('should return 404 when the given genre id is not found, invalid', async () => {
            id = mongoose.Types.ObjectId();
            const res = await exec();
            expect(res.status).toBe(404);
        });

        it('should delete the genre if input is valid, valid', async () => {

            await exec();

            const deletedGenre = await Genre.findById(genre._id);

            expect(deletedGenre).toBeNull();
        });

        it('should return genre object the if it is deleted, valid', async () => {
            const res = await exec();
            expect(res.body).toHaveProperty('_id', id.toHexString());
            expect(res.body).toHaveProperty('name', genre.name);
        });



    });


});

