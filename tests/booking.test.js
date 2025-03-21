const request = require('supertest');
const app = require('../app');

let agent;

beforeAll(() => {
    agent = request.agent(app);  // Maintain session
});

describe('Booking Flow', () => {
    test('Register and login user before booking', async () => {
        await agent.post('/api/register').send({
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: 'password123'
        });

        const loginRes = await agent.post('/api/login').send({
            email: 'testuser@example.com',
            password: 'password123'
        });

        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.success).toBe(true);
    });

    test('Book seat successfully as logged-in user', async () => {
        const bookingPayload = {
            route: 'Nairobi-Mombasa',
            busNumberPlate: 'KDJ 036C',
            date: '2025-04-01',
            seats: ['2'],
            passengerInfo: {
                '2': {
                    firstName: 'Jane',
                    lastName: 'Doe',
                    nationalID: '12345678',
                    phone: '0700123456'
                }
            }
        };

        const res = await agent.post('/api/book-seat').send(bookingPayload);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
