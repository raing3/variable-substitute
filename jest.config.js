module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    automock: true,
    resetModules: true,
    clearMocks: true,
    timers: 'fake',
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.ts'
    ],
    coverageDirectory: '../build/coverage'
};
