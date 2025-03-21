const { connectDB } = require('../db');  // Import the function to test

describe('Database connection error handling', () => {
    test('should log error if database connection fails', (done) => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Force an error by trying to open DB at an invalid path
        connectDB('/invalid/path/busReservations.db');

        // Wait a bit for async error callback to fire
        setTimeout(() => {
            expect(spy).toHaveBeenCalledWith(
                expect.stringContaining('Error opening database:'),
                expect.any(String)
            );
            spy.mockRestore();  // Clean up the spy
            done();  // ✅ Mark test as complete
        }, 500);  // 0.5 second delay
    }, 3000);  // Custom timeout in case of slow response
});
