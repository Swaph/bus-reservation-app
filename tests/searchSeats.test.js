const request = require('supertest');
const express = require('express');
const app = require('../app');

describe('Search and Seat Selection APIs', () => {
    test('Fetch available bus routes', async () => {
        const res = await request(app).get('/api/bus-routes');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        expect(res.body[0]).toHaveProperty('origin');
        expect(res.body[0]).toHaveProperty('destination');
    });

    test('Get available seats for route and date', async () => {
        const res = await request(app).get('/api/available-seats')
            .query({ route: 'Nairobi-Mombasa', date: '2025-04-01' });

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        const bus = res.body[0];
        expect(bus).toHaveProperty('name');
        expect(bus).toHaveProperty('numberPlate');
        expect(Array.isArray(bus.seats)).toBe(true);
    });
});
