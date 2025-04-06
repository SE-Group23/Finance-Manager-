/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    pgm.sql(`
        -- Need to setup a migration tool to handle schema changes
    -- This SQL script creates the initial schema 

    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
    );

    -- Categories Table
    CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL UNIQUE,
    budget_limit DECIMAL
    );

    -- Transactions Table
    CREATE TABLE IF NOT EXISTS transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    amount DECIMAL NOT NULL,
    category_id INTEGER REFERENCES categories(category_id),
    transaction_date TIMESTAMP NOT NULL,
    description TEXT
    );

    -- Assets Table
    CREATE TABLE IF NOT EXISTS assets (
    asset_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    asset_type VARCHAR(100) NOT NULL,
    quantity DECIMAL NOT NULL,
    purchase_value DECIMAL NOT NULL,
    current_value DECIMAL,
    acquired_on TIMESTAMP
    );

    -- Recurring Payments Table
    CREATE TABLE IF NOT EXISTS recurring_payments (
    recurring_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    amount DECIMAL NOT NULL,
    payment_name VARCHAR(255) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    next_due_date TIMESTAMP NOT NULL
    );

    -- Calendar Events Table
    CREATE TABLE IF NOT EXISTS calendar_events (
    event_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    event_title VARCHAR(255) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    event_type VARCHAR(100)
    );

    -- Zakat & Tax Records Table
    CREATE TABLE IF NOT EXISTS zakat_tax_records (
    record_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    zakat_amount DECIMAL,
    tax_amount DECIMAL,
    calculation_date TIMESTAMP NOT NULL
    );
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.sql(`
        -- Drop all tables in reverse order to maintain referential integrity
        DROP TABLE IF EXISTS zakat_tax_records;
        DROP TABLE IF EXISTS calendar_events;
        DROP TABLE IF EXISTS recurring_payments;
        DROP TABLE IF EXISTS assets;
        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS users;
    `)
};
