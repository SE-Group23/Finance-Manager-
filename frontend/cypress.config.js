import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here if needed
      return config; // ✅ Important to return config
    },
    baseUrl: 'https://finance-manager-xi-taupe.vercel.app/', // ✅ Your deployed URL
  },
});
