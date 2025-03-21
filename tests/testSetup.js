// tests/testSetup.js
const db = require('../db');

// SQL to create tables — mimic your real schema
const createTablesSQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    email TEXT UNIQUE,
    password TEXT
);

CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    origin TEXT,
    destination TEXT
);

CREATE TABLE IF NOT EXISTS buses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    numberPlate TEXT,
    type TEXT,
    fare INTEGER,
    departureTime TEXT,
    arrivalTime TEXT,
    route_id INTEGER
);

CREATE TABLE IF NOT EXISTS seats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bus_id INTEGER,
    seat_number TEXT,
    available INTEGER
);

CREATE TABLE IF NOT EXISTS reservations (
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
);
`;

const seedData = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.exec(createTablesSQL, (err) => {
                if (err) return reject(err);

                db.run(`INSERT INTO routes (origin, destination) VALUES (?, ?)`, ['Nairobi', 'Mombasa']);
                db.run(`INSERT INTO buses (name, numberPlate, type, fare, departureTime, arrivalTime, route_id) 
                        VALUES (?, ?, ?, ?, ?, ?, 1)`,
                    ['Test Bus', 'KDJ 036C', 'AC coach', 1800, '6:30 am', '3:00 pm']);
                db.run(`INSERT INTO seats (bus_id, seat_number, available) VALUES (1, '1', 1)`);

                resolve();
            });
        });
    });
};

module.exports = seedData;
