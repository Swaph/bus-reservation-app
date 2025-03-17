const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/busReservations.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables
db.serialize(() => {
    // Users Table (for authentication, not in JSON but needed)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // Routes Table
    db.run(`
        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL
        )
    `);

    // Buses Table
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

    // Seats Table (to track seat availability)
    db.run(`
        CREATE TABLE IF NOT EXISTS seats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bus_id INTEGER NOT NULL,
            seat_number TEXT NOT NULL,
            available INTEGER NOT NULL CHECK (available IN (0,1)),
            FOREIGN KEY (bus_id) REFERENCES buses(id)
        )
    `);

    // Reservations Table
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
