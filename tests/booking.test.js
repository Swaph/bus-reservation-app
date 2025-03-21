const request = require('supertest');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');

let app;
let db;
let agent;

beforeAll((done) => {
    db = new sqlite3.Database(':memory:');  // ✅ In-memory DB for test isolation

    // Create express app using this db
    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        secret: 'test_secret',
        resave: false,
        saveUninitialized: false,
    }));

    // Attach db to app for easier access
    app.set('db', db);

    // ✅ Routes
    app.post('/api/register', (req, res) => {
        const { firstName, lastName, email, password } = req.body;
        const hashed = bcrypt.hashSync(password, 10);
        db.run(`INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`,
            [firstName, lastName, email, hashed],
            (err) => {
                if (err) return res.status(500).json({ error: 'Registration error.' });
                res.status(201).json({ success: true });
            });
    });

    app.post('/api/login', (req, res) => {
        const { email, password } = req.body;
        db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(400).json({ error: "Invalid credentials." });
            }
            req.session.user = { id: user.id, email: user.email };
            req.session.save(() => res.json({ success: true }));
        });
    });

    app.post('/api/book-seat', (req, res) => {
        const userId = req.session?.user?.id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { route, busNumberPlate, date, seats, passengerInfo } = req.body;

        db.get(`SELECT buses.id AS bus_id, routes.id AS route_id FROM buses
                JOIN routes ON buses.route_id = routes.id
                WHERE routes.origin || '-' || routes.destination = ?
                AND buses.numberPlate = ?`,
            [route, busNumberPlate],
            (err, row) => {
                if (err || !row) return res.status(404).json({ error: 'Bus or route not found' });

                const { bus_id, route_id } = row;

                const seatNumber = seats[0];  // Assume 1 seat
                db.get(`SELECT available FROM seats WHERE bus_id = ? AND seat_number = ?`,
                    [bus_id, seatNumber],
                    (err, seatRow) => {
                        if (!seatRow || seatRow.available === 0) {
                            return res.status(400).json({ error: `Seat ${seatNumber} unavailable` });
                        }

                        db.run(`INSERT INTO reservations 
                            (route_id, bus_id, date, seat_number, firstName, lastName, nationalID, phone, user_id)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [route_id, bus_id, date, seatNumber,
                                passengerInfo[seatNumber].firstName,
                                passengerInfo[seatNumber].lastName,
                                passengerInfo[seatNumber].nationalID,
                                passengerInfo[seatNumber].phone,
                                userId],
                            (err) => {
                                if (err) return res.status(500).json({ error: 'Booking failed' });

                                db.run(`UPDATE seats SET available = 0 WHERE bus_id = ? AND seat_number = ?`,
                                    [bus_id, seatNumber],
                                    () => res.status(200).json({ success: true, message: 'Seat booked' }));
                            });
                    });
            });
    });

    // ✅ Create Tables + Sample Data
    db.serialize(() => {
        db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT,
            lastName TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`);
        db.run(`CREATE TABLE routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT,
            destination TEXT
        )`);
        db.run(`CREATE TABLE buses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            numberPlate TEXT UNIQUE,
            type TEXT,
            fare INTEGER,
            departureTime TEXT,
            arrivalTime TEXT,
            route_id INTEGER
        )`);
        db.run(`CREATE TABLE seats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seat_number TEXT,
            available INTEGER,
            bus_id INTEGER
        )`);
        db.run(`CREATE TABLE reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_id INTEGER,
            bus_id INTEGER,
            date TEXT,
            seat_number TEXT,
            firstName TEXT,
            lastName TEXT,
            nationalID TEXT,
            phone TEXT,
            user_id INTEGER
        )`);

        db.run(`INSERT INTO routes (origin, destination) VALUES ('Nairobi', 'Mombasa')`);
        db.run(`INSERT INTO buses (name, numberPlate, type, fare, departureTime, arrivalTime, route_id)
                VALUES ('Test Bus', 'KDJ 036C', 'AC coach', 1800, '6:00 am', '2:00 pm', 1)`);
        db.run(`INSERT INTO seats (seat_number, available, bus_id) VALUES ('2', 1, 1)`);

        agent = request.agent(app);
        done();
    });
});

afterAll((done) => {
    db.close(done);  // ✅ Clean up
});

// TESTS
describe('Booking Flow', () => {
    test('Register and login user before booking', async () => {
        const registerRes = await agent.post('/api/register').send({
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: 'password123'
        });
        expect(registerRes.statusCode).toBe(201);

        const loginRes = await agent.post('/api/login').send({
            email: 'testuser@example.com',
            password: 'password123'
        });
        expect(loginRes.statusCode).toBe(200);
    });

    test('Book seat successfully as logged-in user', async () => {
        const payload = {
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

        const res = await agent.post('/api/book-seat').send(payload);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
