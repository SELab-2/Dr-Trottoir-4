module.exports = {
    preset: "ts-jest",
    roots: ["<rootDir>"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testPathIgnorePatterns: ["/node_modules/", "/.next/"],
    transform: {
        // Use babel-jest to transpile tests with the next/babel preset
        // https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object
        "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
    },
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
        "^@/(.*)$": "<rootDir>/$1",
    },
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
    testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
};
