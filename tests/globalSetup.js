// tests/globalSetup.js
const seedData = require('./testSetup');

beforeAll(async () => {
    await seedData();
});
