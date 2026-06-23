import { defineConfig } from 'cypress';
import allureWriter from '@shelex/cypress-allure-plugin/writer';

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    reporterEnabled: 'mochawesome',
    mochawesomeReporterOptions: {
      reportDir: 'cypress/reports/individual',
      quiet: true,
      overwrite: false,
      html: false,
      json: true,
    },
  },

  e2e: {
    baseUrl: 'http://localhost:4200',

    env: {
      API: 'http://localhost:3000/api',
      allure: true,
    },

    supportFile: 'cypress/support/e2e.ts',

    video: true,

    specPattern: 'cypress/e2e/**/*.cy.ts',

    setupNodeEvents(on, config) {
      allureWriter(on, config);
      return config;
    },
  },

  component: {
    devServer: {
      framework: 'angular',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.ts',
    supportFile: 'cypress/support/component.ts',
  },
});
