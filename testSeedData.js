const testSeedData = (db) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS routes (id INTEGER PRIMARY KEY, origin TEXT, destination TEXT);
                CREATE TABLE IF NOT EXISTS buses (id INTEGER PRIMARY KEY, name TEXT, numberPlate TEXT UNIQUE, type TEXT, fare INTEGER, departureTime TEXT, arrivalTime TEXT, route_id INTEGER);
                CREATE TABLE IF NOT EXISTS seats (id INTEGER PRIMARY KEY, bus_id INTEGER, seat_number TEXT, available INTEGER);
            `, (err) => {
                if (err) return reject(err);  // 🟡 This needs coverage

                // Seed route + bus + seat
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

module.exports = testSeedData;
