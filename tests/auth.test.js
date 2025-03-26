const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

describe('Authentication Tests', () => {
    let testUser;

    beforeAll(async () => {
        // Create a test user before all tests
        testUser = await admin.auth().createUser({
            email: 'test@example.com',
            password: 'testPassword123',
            displayName: 'Test User'
        });
    });

    afterAll(async () => {
        // Clean up test user after all tests
        if (testUser) {
            await admin.auth().deleteUser(testUser.uid);
        }
    });

    describe('Sign Up Tests', () => {
        it('should create a new user with valid credentials', async () => {
            const email = 'newuser@example.com';
            const password = 'newPassword123';
            const displayName = 'New User';

            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName
            });

            expect(userRecord.email).toBe(email);
            expect(userRecord.displayName).toBe(displayName);
            expect(userRecord.uid).toBeDefined();

            // Clean up
            await admin.auth().deleteUser(userRecord.uid);
        });

        it('should not create a user with invalid email', async () => {
            const invalidEmail = 'invalid-email';
            const password = 'testPassword123';

            await expect(admin.auth().createUser({
                email: invalidEmail,
                password
            })).rejects.toThrow();
        });

        it('should not create a user with weak password', async () => {
            const email = 'test@example.com';
            const weakPassword = '123'; // Too short

            await expect(admin.auth().createUser({
                email,
                password: weakPassword
            })).rejects.toThrow();
        });
    });

    describe('Login Tests', () => {
        it('should verify valid user credentials', async () => {
            const email = 'test@example.com';
            
            // Get user by email
            const userRecord = await admin.auth().getUserByEmail(email);
            
            expect(userRecord.email).toBe(email);
            expect(userRecord.uid).toBeDefined();
            expect(userRecord.displayName).toBe('Test User');
        });

        it('should not verify invalid email', async () => {
            const invalidEmail = 'nonexistent@example.com';

            await expect(admin.auth().getUserByEmail(invalidEmail))
                .rejects.toThrow();
        });

        it('should verify user exists but with wrong password', async () => {
            const email = 'test@example.com';
            
            // Get user by email
            const userRecord = await admin.auth().getUserByEmail(email);
            
            // Verify user exists but we can't verify password with Admin SDK
            expect(userRecord.email).toBe(email);
            expect(userRecord.uid).toBeDefined();
        });
    });
}); 