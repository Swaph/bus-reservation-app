const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcryptjs');



const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);


app.use(session({
    store: new SQLiteStore(),  // ✅ Persistent session store
    secret: 'shrek_the_3rd',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 60 * 60 * 1000  // 1 hour session
    }
}));


// ✅ Cleanup function: Delete old reservations every midnight - fix seat availability logic
const clearOldReservations = () => {
    const today = new Date().toISOString().split("T")[0];

    db.run(`DELETE FROM reservations WHERE date < ?`, [today], function (err) {
        if (err) {
            console.error("❌ Error clearing old reservations:", err.message);
            return;
        }
        console.log(`✅ Cleared old reservations before ${today}`);
        // ✅ Reset seat availability EXCEPT for 'Driver', 'ICE', and '38'

        db.run(
            `UPDATE seats SET available = 1 
             WHERE seat_number NOT IN ('Driver', 'ICE', '38')`,
            function (err) {
                if (err) {
                    console.error("❌ Error resetting seat availability:", err.message);
                    return;
                }
                console.log("✅ Successfully reset seat availability for past bookings.");
            }
        );
    });
};

clearOldReservations();  // ✅ Manually trigger it to test

// ✅ API to register User
app.post('/api/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10); // Hash password

    db.run(`INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)`,
        [firstName, lastName, email, hashedPassword],
        function (err) {
            if (err) {
                return res.status(500).json({ error: "User already exists or database error." });
            }
            res.status(201).json({ success: true, message: "User registered successfully!" });
        }
    );
});

// ✅ API to login User
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            console.log("❌ User not found.");
            return res.status(400).json({ error: "Invalid email or password." });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            console.log("❌ Password does not match.");
            return res.status(400).json({ error: "Invalid email or password." });
        }

        // ✅ Store user in session
        req.session.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        };

        console.log("✅ User session created:", req.session.user);

        req.session.save(err => {  // ✅ Ensure session is saved before responding
            if (err) {
                console.log("❌ Error saving session:", err);
                return res.status(500).json({ error: "Session error." });
            }
            res.json({ success: true, message: "Login successful!", user: req.session.user });
        });
    });
});



// ✅ API to get bus routes
app.get('/api/bus-routes', (req, res) => {
    db.all(`SELECT id, origin, destination FROM routes`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // ✅ Return unique routes (avoid duplicates)
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


// ✅ API to get available seats for a specific route and date
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
                return res.status(500).json({ error: "Database error", details: err.message });
            }

            if (rows.length === 0) {
                return res.status(404).json({ error: "No buses found for this route and date." });
            }

            // Group seats by bus
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
                    available: row.available  // ✅ Keep the `available` status correct
                });
            });

            res.json(Object.values(busMap));
        }
    );
});

// ✅ Seat Booking API
app.post('/api/book-seat', (req, res) => {
    console.log("🔍 Checking session at booking:", req.session);

    if (!req.session || !req.session.user) {
        console.log("❌ No session found, user is not logged in.");
        return res.status(401).json({ error: "Unauthorized. Please log in first." });
    }

    console.log("✅ User session found:", req.session.user);

    const userId = req.session.user.id; // ✅ Now it's safe to access
    console.log("Booking request by user ID:", userId);

    const { route, busNumberPlate, date, seats, passengerInfo } = req.body;

    if (!route || !busNumberPlate || !date || !seats || !passengerInfo) {
        return res.status(400).json({ error: "All fields are required." });
    }


    db.get(
        `SELECT buses.id AS bus_id, routes.id AS route_id
         FROM buses
         JOIN routes ON buses.route_id = routes.id
         WHERE routes.origin || '-' || routes.destination = ?
         AND buses.numberPlate = ?`,
        [route, busNumberPlate],
        (err, row) => {
            if (err) {
                console.error("❌ Database error:", err);
                return res.status(500).json({ error: "Database error", details: err.message });
            }
            if (!row) return res.status(404).json({ error: "Bus or route not found" });

            const busID = row.bus_id;
            const routeID = row.route_id;

            // ✅ Process seat bookings one by one
            const seatQueries = seats.map(seatNumber => {
                return new Promise((resolve, reject) => {
                    db.get(
                        `SELECT available FROM seats WHERE bus_id = ? AND seat_number = ?`,
                        [busID, seatNumber],
                        (err, seatRow) => {
                            if (err) return reject(err);
                            if (!seatRow || seatRow.available === 0) {
                                return reject(new Error(`Seat ${seatNumber} is already booked.`));
                            }

                            // ✅ Insert reservation
                            db.run(
                                `INSERT INTO reservations (route_id, bus_id, date, seat_number, firstName, lastName, nationalID, phone, user_id)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    routeID,
                                    busID,
                                    date,
                                    seatNumber,
                                    passengerInfo[seatNumber].firstName,
                                    passengerInfo[seatNumber].lastName,
                                    passengerInfo[seatNumber].nationalID,
                                    passengerInfo[seatNumber].phone,
                                    userId  // ✅ Store the user who booked the seat
                                ],
                                function (err) {
                                    if (err) return reject(err);

                                    // ✅ Mark seat as unavailable
                                    db.run(
                                        `UPDATE seats SET available = 0 WHERE bus_id = ? AND seat_number = ?`,
                                        [busID, seatNumber],
                                        (err) => {
                                            if (err) return reject(err);
                                            resolve();
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
            });

            Promise.all(seatQueries)
                .then(() => {
                    res.status(200).json({ success: true, message: "Seats booked successfully!" });
                })
                .catch(err => {
                    console.error("❌ Failed to book seats:", err);
                    res.status(500).json({ error: err.message });
                });
        }
    );
});


// ✅ API to view all reservations for a specific date
app.get('/api/reservations', (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: "Date is required." });
    }

    db.all(
        `SELECT reservations.id, routes.origin || '-' || routes.destination AS route, buses.name, buses.numberPlate,
                reservations.seat_number, reservations.date, reservations.firstName, reservations.lastName, reservations.phone
         FROM reservations
         JOIN buses ON reservations.bus_id = buses.id
         JOIN routes ON reservations.route_id = routes.id
         WHERE reservations.date = ?`,
        [date],
        (err, rows) => {
            if (err) return res.status(500).json({ error: "Database error", details: err.message });
            res.json(rows);
        }
    );
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Logout failed." });
        res.json({ success: true, message: "Logged out successfully!" });
    });
});


// ✅ Force login before showing index.html
app.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html');  // 🔹 Redirect to login page if not authenticated
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Serve static files AFTER authentication check
// Middleware to protect static files
app.use((req, res, next) => {
    const publicFiles = ['/login.html', '/register.html'];
    const publicFolders = ['/css/', '/js/', '/images/', '/fonts/'];  // add folders if needed

    // Allow public files like login.html
    if (publicFiles.includes(req.path)) {
        return next();
    }

    // Allow access to static files in public folders (CSS/JS/images/fonts)
    if (publicFolders.some(folder => req.path.startsWith(folder))) {
        return next();
    }

    // Allow API routes without auth
    if (req.path.startsWith('/api')) {
        return next();
    }

    // Otherwise, require login
    if (!req.session.user) {
        return res.redirect('/login.html');
    }

    next();
});

app.use(express.static(path.join(__dirname, 'public')));


// ✅ Serve frontend pages
app.get('/search-results', (req, res) => res.sendFile(path.join(__dirname, 'public', 'searchResults.html')));
app.get('/seatSelection.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'seatSelection.html')));
app.get('/reservationSummary.html', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reservationSummary.html')));


// Schedule cleanup every midnight
const schedule = require('node-schedule');

schedule.scheduleJob('0 0 * * *', () => {
    console.log("🕛 Running scheduled cleanup...");
    clearOldReservations();
});


// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
