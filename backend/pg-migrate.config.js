require('dotenv').config({ path: '../.env' });

module.exports = {
  migrationDirectory: 'db/migrations',
  direction: 'up',
  logFileName: 'migrations.log',
  databaseUrl: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
};
