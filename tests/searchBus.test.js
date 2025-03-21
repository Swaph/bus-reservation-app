const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

// Create in-memory database
const db = new sqlite3.Database(':memory:');

// Set up app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore({ db: 'test-sessions.sqlite' }),
    secret: 'test_secret',
    resave: false,
    saveUninitialized: false
}));

// --- ROUTES (Copied from app.js) --- //
app.get('/api/bus-routes', (req, res) => {
    db.all(`SELECT id, origin, destination FROM routes`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const uniqueRoutes = [];
        const seenRoutes = new Set();

        rows.forEach(route => {
            const key = `${route.origin}-${route.destination}`;
            if (!seenRoutes.has(key)) {
                seenRoutes.add(key);
                uniqueRoutes.push(route);
            }
        });

        res.json(uniqueRoutes);
    });
});

app.get('/api/available-seats', (req, res) => {
    const { route, date } = req.query;

    if (!route || !date) {
        return res.status(400).json({ error: "Route and date are required." });
    }

    db.all(
        `SELECT buses.name, buses.numberPlate, buses.type, buses.fare, buses.departureTime, buses.arrivalTime,
                routes.origin || '-' || routes.destination AS route,
                seats.seat_number, seats.available
         FROM buses
         JOIN routes ON buses.route_id = routes.id
         JOIN seats ON seats.bus_id = buses.id
         WHERE route = ?`,
        [route],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: "No buses found for this route and date." });
            }

            const busMap = {};
            rows.forEach(row => {
                if (!busMap[row.numberPlate]) {
                    busMap[row.numberPlate] = {
                        name: row.name,
                        numberPlate: row.numberPlate,
                        type: row.type,
                        fare: row.fare,
                        departureTime: row.departureTime,
                        arrivalTime: row.arrivalTime,
                        route: row.route,
                        seats: []
                    };
                }
                busMap[row.numberPlate].seats.push({
                    seatNumber: row.seat_number,
                    available: row.available
                });
            });

            res.json(Object.values(busMap));
        }
    );
});

// --- TEST SETUP --- //
beforeAll(done => {
    // Create necessary tables and sample data
    db.serialize(() => {
        db.run(`CREATE TABLE routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT,
            destination TEXT
        )`);
        db.run(`CREATE TABLE buses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            numberPlate TEXT,
            type TEXT,
            fare INTEGER,
            departureTime TEXT,
            arrivalTime TEXT,
            route_id INTEGER
        )`);
        db.run(`CREATE TABLE seats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_id INTEGER,
            seat_number TEXT,
            available INTEGER
        )`);

        // Insert route
        db.run(`INSERT INTO routes (origin, destination) VALUES ('Nairobi', 'Mombasa')`, function () {
            const routeId = this.lastID;

            // Insert bus linked to route
            db.run(`INSERT INTO buses (name, numberPlate, type, fare, departureTime, arrivalTime, route_id)
                    VALUES ('Jiji Bus', 'KDJ 036C', 'AC coach', 1800, '6:30 am', '3:00 pm', ?)`, [routeId], function () {
                const busId = this.lastID;

                // Insert seat
                db.run(`INSERT INTO seats (bus_id, seat_number, available) VALUES (?, '2', 1)`, [busId], done);
            });
        });
    });
});

afterAll(done => {
    db.close(done);
});

// --- TEST CASES --- //
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
