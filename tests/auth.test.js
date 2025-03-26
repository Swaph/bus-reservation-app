const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = getAuth();

describe('Authentication Tests', () => {
    let testUser;

    beforeAll(async () => {
        // Create a test user before all tests
        testUser = await auth.createUser({
            email: 'test@example.com',
            password: 'testPassword123',
            displayName: 'Test User'
        });
    });

    afterAll(async () => {
        // Clean up test user after all tests
        if (testUser) {
            await auth.deleteUser(testUser.uid);
        }
    });

    describe('Sign Up Tests', () => {
        it('should create a new user with valid credentials', async () => {
            const email = 'newuser@example.com';
            const password = 'newPassword123';
            const displayName = 'New User';

            const userRecord = await auth.createUser({
                email,
                password,
                displayName
            });

            expect(userRecord.email).toBe(email);
            expect(userRecord.displayName).toBe(displayName);
            expect(userRecord.uid).toBeDefined();

            // Clean up
            await auth.deleteUser(userRecord.uid);
        });

        it('should not create a user with invalid email', async () => {
            const invalidEmail = 'invalid-email';
            const password = 'testPassword123';

            await expect(auth.createUser({
                email: invalidEmail,
                password
            })).rejects.toThrow();
        });

        it('should not create a user with weak password', async () => {
            const email = 'test@example.com';
            const weakPassword = '123'; // Too short

            await expect(auth.createUser({
                email,
                password: weakPassword
            })).rejects.toThrow();
        });
    });

    describe('Login Tests', () => {
        it('should verify valid user credentials', async () => {
            const email = 'test@example.com';
            const password = 'testPassword123';

            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            expect(userCredential.user.email).toBe(email);
            expect(userCredential.user.uid).toBeDefined();
        });

        it('should not verify invalid email', async () => {
            const invalidEmail = 'nonexistent@example.com';
            const password = 'testPassword123';

            await expect(auth.signInWithEmailAndPassword(invalidEmail, password))
                .rejects.toThrow();
        });

        it('should not verify invalid password', async () => {
            const email = 'test@example.com';
            const wrongPassword = 'wrongPassword123';

            await expect(auth.signInWithEmailAndPassword(email, wrongPassword))
                .rejects.toThrow();
        });
    });
}); 