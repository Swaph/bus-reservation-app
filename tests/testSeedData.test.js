const sqlite3 = require('sqlite3').verbose();
const testSeedData = require('../testSeedData');  // Assuming testSeedData.js is in root

describe('testSeedData seeding utility', () => {
    let db;

    beforeEach((done) => {
        db = new sqlite3.Database(':memory:', (err) => {
            if (err) return done(err);

            db.serialize(() => {
                db.run(`CREATE TABLE routes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    origin TEXT NOT NULL,
                    destination TEXT NOT NULL
                )`);
                db.run(`CREATE TABLE buses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    numberPlate TEXT UNIQUE NOT NULL,
                    type TEXT NOT NULL,
                    fare INTEGER NOT NULL,
                    departureTime TEXT NOT NULL,
                    arrivalTime TEXT NOT NULL,
                    route_id INTEGER NOT NULL
                )`);
                db.run(`CREATE TABLE seats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    bus_id INTEGER NOT NULL,
                    seat_number TEXT NOT NULL,
                    available INTEGER NOT NULL
                )`, done);
            });
        });
    });

    afterEach((done) => {
        db.close(done);
    });

    test('Seeds data into in-memory DB successfully', async () => {
        await expect(testSeedData(db)).resolves.toBeUndefined();

        // Validate data inserted
        db.get(`SELECT * FROM routes WHERE origin = 'Nairobi'`, (err, row) => {
            expect(row).toBeTruthy();
            expect(row.destination).toBe('Mombasa');
        });
    });

    test('Rejects if insert fails (simulate error)', async () => {
        await testSeedData(db);  // First insert is OK

        // Second insert should fail due to UNIQUE constraint (duplicate numberPlate)
        await expect(testSeedData(db)).rejects.toThrow(/SQLITE_CONSTRAINT/);
    });
});
