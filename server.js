require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Firebase configuration
app.get('/firebase-config', (req, res) => {
    const config = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    };
    res.json(config);
});

// Serve config.js with environment variables
app.get('/auth/config.js', (req, res) => {
    const configTemplate = fs.readFileSync(path.join(__dirname, 'public/auth/config.js'), 'utf8');
    const config = configTemplate
        .replace('<%= FIREBASE_API_KEY %>', process.env.FIREBASE_API_KEY)
        .replace('<%= FIREBASE_AUTH_DOMAIN %>', process.env.FIREBASE_AUTH_DOMAIN)
        .replace('<%= FIREBASE_PROJECT_ID %>', process.env.FIREBASE_PROJECT_ID)
        .replace('<%= FIREBASE_STORAGE_BUCKET %>', process.env.FIREBASE_STORAGE_BUCKET)
        .replace('<%= FIREBASE_MESSAGING_SENDER_ID %>', process.env.FIREBASE_MESSAGING_SENDER_ID)
        .replace('<%= FIREBASE_APP_ID %>', process.env.FIREBASE_APP_ID)
        .replace('<%= FIREBASE_MEASUREMENT_ID %>', process.env.FIREBASE_MEASUREMENT_ID);
    res.setHeader('Content-Type', 'application/javascript');
    res.send(config);
});

// Authentication middleware
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Load data from JSON files
const dataPath = path.join(__dirname, 'data', 'busData.json');
const reservationsPath = path.join(__dirname, 'data', 'reservations.json');
let busData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let reservations = JSON.parse(fs.readFileSync(reservationsPath, 'utf8'));

// Public routes
app.get('/api/bus-routes', (req, res) => {
    res.json(busData.routes);
});

// Protected routes
app.get('/api/available-seats', authenticateUser, (req, res) => {
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

app.post('/api/reserve-seat', authenticateUser, (req, res) => {
    const { route, date, seats, passengerInfo } = req.body;
    if (!route || !date || !seats || !passengerInfo) {
        return res.status(400).send('Route, date, seats, and passengerInfo are required');
    }
    const bus = busData.buses.find(b => b.route === route && b.dates.includes(date));
    if (bus) {
        const newReservation = { 
            route, 
            date, 
            seats: [], 
            passengerInfo: {},
            userId: req.user.uid // Add user ID to reservation
        };
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

// Serve static files
app.get('/search-results', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'searchResults.html'));
});

app.get('/seatSelection.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'seatSelection.html'));
});

app.get('/reservationSummary.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reservationSummary.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
