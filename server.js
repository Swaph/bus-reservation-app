const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const admin = require("firebase-admin");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load data from JSON files
const dataPath = path.join(__dirname, 'data', 'busData.json');
const reservationsPath = path.join(__dirname, 'data', 'reservations.json');
let busData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let reservations = JSON.parse(fs.readFileSync(reservationsPath, 'utf8'));

// API to get bus routes
app.get('/api/bus-routes', (req, res) => {
    res.json(busData.routes);
});
// Initialize Firebase Admin
const serviceAccount = require("./firebase-service-account.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// API to get available seats for a specific route and date
app.get('/api/available-seats', (req, res) => {
    const { route, date } = req.query;
    if (!route || !date) {
        return res.status(400).send('Route and date are required');
    }
    const buses = busData.buses.filter(b => b.route === route && b.dates.includes(date));
    if (buses.length > 0) {
        buses.forEach(bus => {
            reservations.forEach(reservation => {
                if (reservation.route === route && reservation.date === date) {
                    reservation.seats.forEach(seat => {
                        if (bus.seats[seat]) {
                            bus.seats[seat].available = false;
                        }
                    });
                }
            });
        });
        res.json(buses);
    } else {
        res.status(404).send('No buses found');
    }
});

// API to make a reservation
app.post('/api/reserve-seat', (req, res) => {
    const { route, date, seats, passengerInfo } = req.body;
    if (!route || !date || !seats || !passengerInfo) {
        return res.status(400).send('Route, date, seats, and passengerInfo are required');
    }
    const bus = busData.buses.find(b => b.route === route && b.dates.includes(date));
    if (bus) {
        const newReservation = { route, date, seats: [], passengerInfo: {} };
        seats.forEach(seat => {
            if (bus.seats[seat] && bus.seats[seat].available) {
                bus.seats[seat].available = false;
                newReservation.seats.push(seat);
                newReservation.passengerInfo[seat] = passengerInfo[seat];
            }
        });
        reservations.push(newReservation);
        fs.writeFileSync(dataPath, JSON.stringify(busData, null, 2), 'utf8');
        fs.writeFileSync(reservationsPath, JSON.stringify(reservations, null, 2), 'utf8');
        res.json({ success: true });
    } else {
        res.status(400).send('Seats not available');
    }
});


// Serve the search results page
app.get('/search-results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'searchResults.html'));
});

// Serve the seat selection page
app.get('/seatSelection.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'seatSelection.html'));
});

// Serve the reservation summary page
app.get('/reservationSummary.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reservationSummary.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
