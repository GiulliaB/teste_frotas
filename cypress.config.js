const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl:"https://frotas.app.fslab.dev",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
