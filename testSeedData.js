const testSeedData = (db) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Insert Route
            db.run(`INSERT INTO routes (origin, destination) VALUES (?, ?)`, ['Nairobi', 'Mombasa'], (err) => {
                if (err) return reject(err);

                // Insert Bus
                db.run(`INSERT INTO buses (name, numberPlate, type, fare, departureTime, arrivalTime, route_id)
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['Test Bus', 'KDJ 036C', 'AC coach', 1800, '6:30 am', '3:00 pm', 1], (err) => {
                        if (err) return reject(err);

                        // Insert Seat
                        db.run(`INSERT INTO seats (bus_id, seat_number, available) VALUES (?, ?, ?)`,
                            [1, '1', 1], (err) => {
                                if (err) return reject(err);

                                resolve();
                            });
                    });
            });
        });
    });
};

module.exports = testSeedData;
