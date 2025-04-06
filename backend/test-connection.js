require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log("Connected successfully!");
    return client.end();
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });
