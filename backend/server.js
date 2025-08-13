// server.js
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3001;

app.use(express.json());

let pool = null;

// Function to connect to the DB. Can be called on startup and for reconfiguration.
const connectToDb = async (config) => {
    // Close the old connection if it exists
    if (pool) {
        await pool.end();
        console.log('Previous DB connection closed.');
    }

    console.log('Attempting to connect to the database with config:', {
        host: config.host,
        user: config.user,
        database: config.database,
        port: config.port,
    });

    pool = new Pool(config);

    // Test the new connection
    const client = await pool.connect();
    client.release();
    console.log('Successfully established connection to the database.');
};

// Endpoint to dynamically reconfigure the DB
app.post('/api/config-db', async (req, res) => {
    const { host, user, password, database } = req.body;
    console.log('Received new DB configuration:', { host, user, database });

    try {
        if (!host || !user || !password || !database) {
            return res.status(400).json({ status: 'error', message: 'All credentials are required.' });
        }
        
        const newDbConfig = { host, user, password, database, port: process.env.DB_PORT || 5432 };
        await connectToDb(newDbConfig);

        res.status(200).json({ status: 'ok', message: 'Database connection configured successfully.' });
    } catch (err) {
        pool = null; // Reset pool on failure
        console.error('Failed to configure database:', err.message);
        res.status(500).json({ status: 'error', message: `Failed to connect: ${err.message}` });
    }
});

app.get('/api/db-status', async (req, res) => {
    if (!pool) {
        return res.status(200).json({ status: 'offline', message: 'Database not configured or offline.' });
    }

    try {
        await pool.query('SELECT NOW()');
        res.status(200).json({ status: 'online', message: 'Database connection is active.' });
    } catch (err) {
        console.error('DB status error:', err.message);
        res.status(500).json({ status: 'error', message: `Connection error: ${err.message}` });
    }
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
    
    // Attempt initial connection with environment variables
    const initialDbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
    };

    if (initialDbConfig.host && initialDbConfig.user && initialDbConfig.password && initialDbConfig.database) {
        console.log('Attempting automatic DB connection using environment variables.');
        connectToDb(initialDbConfig).catch(err => {
            console.error('Initial automatic DB connection failed:', err.message);
            pool = null; // Ensure status is 'offline' if initial connection fails
        });
    } else {
        console.warn('DB environment variables are not fully set. Awaiting configuration via API.');
    }
});
