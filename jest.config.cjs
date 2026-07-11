// jest.config.cjs
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  clearMocks: true,
  setupFiles: ["dotenv/config"],
  testTimeout: 60000,
  maxWorkers: 1,
};
