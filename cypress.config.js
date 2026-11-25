import { defineConfig } from 'cypress';
import mongoose from 'mongoose';

export default defineConfig({
  video: true,
  allowCypressEnv: false,
  videoCompression: 20,
  viewportWidth: 1280,
  viewportHeight: 900,
  screenshotsFolder: 'evidence/cypress/screenshots',
  videosFolder: 'evidence/cypress/videos',
  e2e: {
    baseUrl: 'http://127.0.0.1:5615',
    supportFile: false,
    setupNodeEvents(on) {
      on('task', {
        credentials() {
          return {
            adminEmail: process.env.ADMIN_EMAIL, adminPassword: process.env.ADMIN_PASSWORD,
            userEmail: 'reader@example.test', userPassword: process.env.TEST_USER_PASSWORD,
          };
        },
        async savedContact(id) {
          const connection = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
          try {
            const doc = await connection.db.collection('contacts').findOne({ _id: new mongoose.Types.ObjectId(id) });
            return doc && JSON.parse(JSON.stringify(doc));
          } finally {
            await connection.close();
          }
        },
      });
    },
  },
});
