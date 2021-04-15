const request = require('supertest');
const { User } = require('../../../models/users');
const { Genre } = require('../../../models/genres');
let server;
describe('auth middleware', () => {
    beforeEach(() => {
        server = require('../../../index');
        token = new User().generateAuthToken();
    });
    afterEach(async () => {
        server.close();
        await Genre.remove({});
    });

    // refactoring with happy path
    let token;
    const exec = () => {
        return request(server)
            .post('/api/genres')
            .set('x-auth-token', token)
            .send({ name: 'genre1' });
    }

    it('should return 401 if no token provided, invalid', async () => {
        token = '';

        const res = await exec();

        expect(res.status).toBe(401);
    });


    it('should return 400 if invalid token provided, invalid', async () => {
        token = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });


    it('should return 200 if valid token provided, valid', async () => {

        const res = await exec();

        expect(res.status).toBe(200);
    });
});