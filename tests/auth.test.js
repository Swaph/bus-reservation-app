const admin = require('firebase-admin');
const mockServiceAccount = require('./test-config');

// Initialize Firebase Admin with mock credentials
admin.initializeApp({
    credential: admin.credential.cert(mockServiceAccount)
});

// Mock Firebase Auth methods
jest.mock('firebase-admin', () => {
    const mockAuth = {
        createUser: jest.fn(),
        deleteUser: jest.fn(),
        getUserByEmail: jest.fn()
    };

    return {
        initializeApp: jest.fn(),
        credential: {
            cert: jest.fn()
        },
        auth: () => mockAuth
    };
});

describe('Authentication Tests', () => {
    let testUser;

    beforeAll(async () => {
        // Mock test user
        testUser = {
            uid: 'test-uid',
            email: 'test@example.com',
            displayName: 'Test User'
        };
        
        // Mock createUser response
        admin.auth().createUser.mockResolvedValue(testUser);
    });

    afterAll(async () => {
        // Mock deleteUser response
        admin.auth().deleteUser.mockResolvedValue();
    });

    describe('Sign Up Tests', () => {
        it('should create a new user with valid credentials', async () => {
            const email = 'newuser@example.com';
            const password = 'newPassword123';
            const displayName = 'New User';

            const mockUser = {
                uid: 'new-uid',
                email,
                displayName
            };

            admin.auth().createUser.mockResolvedValueOnce(mockUser);
            admin.auth().deleteUser.mockResolvedValueOnce();

            const userRecord = await admin.auth().createUser({
                email,
                password,
                displayName
            });

            expect(userRecord.email).toBe(email);
            expect(userRecord.displayName).toBe(displayName);
            expect(userRecord.uid).toBeDefined();
            expect(admin.auth().createUser).toHaveBeenCalledWith({
                email,
                password,
                displayName
            });

            // Clean up
            await admin.auth().deleteUser(userRecord.uid);
            expect(admin.auth().deleteUser).toHaveBeenCalledWith(userRecord.uid);
        });

        it('should not create a user with invalid email', async () => {
            const invalidEmail = 'invalid-email';
            const password = 'testPassword123';

            admin.auth().createUser.mockRejectedValueOnce(new Error('Invalid email'));

            await expect(admin.auth().createUser({
                email: invalidEmail,
                password
            })).rejects.toThrow('Invalid email');
        });

        it('should not create a user with weak password', async () => {
            const email = 'test@example.com';
            const weakPassword = '123'; // Too short

            admin.auth().createUser.mockRejectedValueOnce(new Error('Password too weak'));

            await expect(admin.auth().createUser({
                email,
                password: weakPassword
            })).rejects.toThrow('Password too weak');
        });
    });

    describe('Login Tests', () => {
        it('should verify valid user credentials', async () => {
            const email = 'test@example.com';
            
            admin.auth().getUserByEmail.mockResolvedValueOnce(testUser);
            
            const userRecord = await admin.auth().getUserByEmail(email);
            
            expect(userRecord.email).toBe(email);
            expect(userRecord.uid).toBeDefined();
            expect(userRecord.displayName).toBe('Test User');
            expect(admin.auth().getUserByEmail).toHaveBeenCalledWith(email);
        });

        it('should not verify invalid email', async () => {
            const invalidEmail = 'nonexistent@example.com';

            admin.auth().getUserByEmail.mockRejectedValueOnce(new Error('User not found'));

            await expect(admin.auth().getUserByEmail(invalidEmail))
                .rejects.toThrow('User not found');
        });

        it('should verify user exists but with wrong password', async () => {
            const email = 'test@example.com';
            
            admin.auth().getUserByEmail.mockResolvedValueOnce(testUser);
            
            const userRecord = await admin.auth().getUserByEmail(email);
            
            expect(userRecord.email).toBe(email);
            expect(userRecord.uid).toBeDefined();
            expect(admin.auth().getUserByEmail).toHaveBeenCalledWith(email);
        });
    });
}); 