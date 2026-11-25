import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import mongoose from 'mongoose';
import cypress from 'cypress';

const suffix = randomBytes(8).toString('hex');
const name = 'portfolio_test_' + suffix;
const base = new URL(process.env.TEST_MONGO_URL || 'mongodb://127.0.0.1:27017');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) {
  throw new Error('E2E tests require an isolated localhost MongoDB server.');
}
base.pathname = '/' + name;
const uri = base.toString();
const env = {
  ...process.env,
  NODE_ENV: 'test',
  MONGODB_URI: uri,
  JWT_SECRET: randomBytes(32).toString('hex'),
  ADMIN_EMAIL: 'admin@example.test',
  ADMIN_PASSWORD: randomBytes(20).toString('hex'),
  TEST_USER_PASSWORD: randomBytes(20).toString('hex'),
  PORT: '5615',
  APP_COMMIT: name,
};
const children = [];
let connection;
function command(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { env, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error('Setup command failed.')));
  });
}
try {
  await mkdir('evidence', { recursive: true });
  connection = await mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000 }).asPromise();
  await command(process.execPath, ['scripts/seed-admin.js']);
  const server = spawn(process.execPath, ['server.js'], { env, stdio: 'inherit' });
  children.push(server);
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null) throw new Error('Test API exited.');
    const health = await fetch('http://127.0.0.1:5615/api/health').then(r => r.json()).catch(() => null);
    if (health?.commit === name && health.status === 'ok') { ready = true; break; }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Isolated test server did not become ready.');

  // Cypress's Node-side tasks receive credentials; browser command logs never print them.
  Object.assign(process.env, env);
  const result = await cypress.run({ browser: process.env.CYPRESS_BROWSER || 'chrome' });
  if (!('totalFailed' in result)) throw new Error('Cypress could not launch.');
  const summary = {
    totalTests: result.totalTests, totalPassed: result.totalPassed,
    totalFailed: result.totalFailed, durationMs: result.totalDuration,
    runs: result.runs.map(run => ({ spec: run.spec.relative, video: run.video })),
  };
  await writeFile('evidence/e2e-results.json', JSON.stringify(summary, null, 2));
  if (result.totalFailed || result.totalTests === 0) process.exitCode = 1;
} catch (error) {
  console.error('E2E failed:', error.message.replaceAll(uri, '[test database]'));
  process.exitCode = 1;
} finally {
  for (const child of children) child.kill('SIGTERM');
  if (connection) {
    // Only this generated database is removed, including after a failed run.
    if (connection.name !== name || !/^portfolio_test_[a-f0-9]{16}$/.test(name)) {
      throw new Error('Refusing unsafe cleanup.');
    }
    await connection.dropDatabase();
    await connection.close();
  }
}
