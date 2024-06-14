const express = require('express');
const session = require('express-session');
const Keycloak = require('keycloak-connect');
const mariadb = require('mariadb');

const app = express();
const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak({ store: memoryStore });

const pool = mariadb.createPool({
    host: 'mariadb-node1',
    user: 'user',
    password: 'password',
    database: 'mydb'
});

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

app.use(keycloak.middleware());

app.get('/api', keycloak.protect(), async (req, res) => {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query("SELECT 1 as val");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) conn.release();
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
