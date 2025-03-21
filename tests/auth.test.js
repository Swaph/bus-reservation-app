const request = require('supertest');
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');

// 🧠 In-memory DB for isolated tests
const db = new sqlite3.Database(':memory:');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new SQLiteStore({ db: 'test-sessions.sqlite' }),
    secret: 'test_secret',
    resave: false,
    saveUninitialized: false
}));

// -------------------- ROUTES -------------------- //
// Register
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`,
        [firstName, lastName, email, hashedPassword],
        function (err) {
            if (err) return res.status(500).json({ error: "User exists or error." });
            res.status(201).json({ success: true });
        });
});

// Login
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

// -------------------- SETUP -------------------- //
beforeAll(done => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        email TEXT UNIQUE,
        password TEXT
    )`, done);
});

afterAll(done => {
    db.close(done);
});

// -------------------- TEST CASES -------------------- //
describe('User Authentication API', () => {
    test('Register a new user successfully', async () => {
        const res = await request(app).post('/api/register').send({
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    test('Login with correct credentials', async () => {
        const res = await request(app).post('/api/login').send({
            email: 'jane@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('Login fails with wrong password', async () => {
        const res = await request(app).post('/api/login').send({
            email: 'jane@example.com',
            password: 'wrongpassword'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBeUndefined();
    });
});
