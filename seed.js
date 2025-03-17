const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Connect to (or create) the database
const db = new sqlite3.Database('./data/busReservations.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
    }
});

// Load the JSON files
const routesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'routes.json'), 'utf8'));
const busesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'buses.json'), 'utf8'));
const seatsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'seats.json'), 'utf8'));

// Seed data from json to database
db.serialize(() => {
    // Insert routes
    const insertRoute = db.prepare(`INSERT INTO routes (origin, destination) VALUES (?, ?)`);
    routesData.forEach(route => {
        insertRoute.run(route.origin, route.destination, (err) => {
            if (err) console.error('❌ Route insert error:', err.message);
        });
    });
    insertRoute.finalize();

    // Insert buses
    const insertBus = db.prepare(`
        INSERT INTO buses (name, numberPlate, type, fare, departureTime, arrivalTime, route_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    busesData.forEach(bus => {
        insertBus.run(bus.name, bus.numberPlate, bus.type, bus.fare, bus.departureTime, bus.arrivalTime, bus.route_id, (err) => {
            if (err) console.error('❌ Bus insert error:', err.message);
        });
    });
    insertBus.finalize();

    // Insert seats
    const insertSeat = db.prepare(`
        INSERT INTO seats (bus_id, seat_number, available) VALUES (?, ?, ?)
    `);
    seatsData.forEach(seat => {
        insertSeat.run(seat.bus_id, seat.seat_number, seat.available, (err) => {
            if (err) console.error(`❌ Seat ${seat.seat_number} insert error:`, err.message);
        });
    });
    insertSeat.finalize();

    console.log('✅ Data import completed!');
});

db.close();
