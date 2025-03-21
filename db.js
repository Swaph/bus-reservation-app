const sqlite3 = require('sqlite3').verbose();

function connectDB(dbPath) {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to SQLite database.');
        }
    });
}

const isTest = process.env.NODE_ENV === 'test';
const db = connectDB(isTest ? ':memory:' : './data/busReservations.db');

// ✅ Create tables (works for both in-memory and file-based DBs)
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS buses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            numberPlate TEXT UNIQUE NOT NULL,
            departureTime TEXT NOT NULL,
            arrivalTime TEXT NOT NULL,
            type TEXT NOT NULL,
            fare INTEGER NOT NULL,
            route_id INTEGER NOT NULL,
            FOREIGN KEY (route_id) REFERENCES routes(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS seats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_id INTEGER NOT NULL,
            seat_number TEXT NOT NULL,
            available INTEGER NOT NULL CHECK (available IN (0,1)),
            FOREIGN KEY (bus_id) REFERENCES buses(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_id INTEGER NOT NULL,
            bus_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            seat_number TEXT NOT NULL,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            nationalID TEXT NOT NULL,
            phone TEXT NOT NULL,
            FOREIGN KEY (route_id) REFERENCES routes(id),
            FOREIGN KEY (bus_id) REFERENCES buses(id)
        )
    `);
});

module.exports = db;
module.exports.connectDB = connectDB;  // Exported for testing only
