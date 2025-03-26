const sqlite3 = require('sqlite3').verbose();
const db = require('C:/Users/hp/Desktop/bus-reservation-app-main/public/db.js'); // Ensure this path is correct

describe('Bus Reservation System - Database Tests', () => {
    beforeAll((done) => {
        db.serialize(() => {
            db.run('DELETE FROM users');
            db.run('DELETE FROM routes');
            db.run('DELETE FROM buses');
            db.run('DELETE FROM seats');
            db.run('DELETE FROM reservations', done);
        });
    });

    afterAll((done) => {
        db.close(done);
    });

    test('Should connect to the database', () => {
        expect(db).toBeDefined();
    });

    test('Should create and fetch a user', (done) => {
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['testUser', 'password123'], function (err) {
            expect(err).toBeNull();

            db.get(`SELECT * FROM users WHERE username = ?`, ['testUser'], (err, row) => {
                expect(err).toBeNull();
                expect(row).toBeDefined();
                expect(row.username).toBe('testUser');
                expect(row.password).toBe('password123');
                done();
            });
        });
    });
});

