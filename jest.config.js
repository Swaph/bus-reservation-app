module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        '**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'coverage',
            outputName: 'junit.xml',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}'
        }]
    ]
}; 