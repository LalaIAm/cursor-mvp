import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: "d6qyyg",
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    reporter: "junit",
    reporterOptions: {
      mochaFile: "cypress/reports/junit-[hash].xml",
      toConsole: true,
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});

