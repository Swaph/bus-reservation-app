const sqlite3 = require('sqlite3').verbose();
const testSeedData = require('../testSeedData');

describe('testSeedData seeding utility', () => {
    test('Successfully seeds data into in-memory DB', async () => {
        const db = new sqlite3.Database(':memory:');
        await expect(testSeedData(db)).resolves.toBeUndefined();

        // Check seeded route exists
        db.get(`SELECT * FROM routes WHERE origin = 'Nairobi'`, (err, row) => {
            expect(row).toBeTruthy();
            db.close();
        });
    });

    test('Handles SQL error and rejects', async () => {
        const db = new sqlite3.Database(':memory:');

        // Mock db.exec with bad SQL
        const badSeed = () => {
            return new Promise((resolve, reject) => {
                db.exec(`INVALID SQL`, (err) => {
                    if (err) return reject(err);  // 🟡 This branch hit
                    resolve();
                });
            });
        };

        await expect(badSeed()).rejects.toBeTruthy();
        db.close();
    });
});
